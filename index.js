require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const xlsx = require('xlsx');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const connection = require('./connectdb');


const LOGIN_URL = 'https://mira-admin.smatec.com.vn/admin/login';
const SEARCH_URL = 'https://mira-admin.smatec.com.vn/admin/devices/';
let token = '';
let lastLoginTime = 0;
const TOKEN_EXPIRY = 30 * 60 * 1000; // 30 phút

// const query = 'SELECT * FROM mira_device'; // Truy vấn để lấy danh sách thiết bị
// connection.query(query, (err, results) => {
//     if (err) {
//         reject('Lỗi khi truy vấn cơ sở dữ liệu: ' + err);
//     } else {

//         console.log('Danh sách:');
//         console.log(results);
//     }
// });


// 1️⃣ **Đăng nhập nếu cần**
async function loginIfNeeded() {
    const now = Date.now();
    if (!token || now - lastLoginTime > TOKEN_EXPIRY) {
        try {
            const res = await axios.post(LOGIN_URL, {
                username: process.env.LOGIN_USER,
                password: process.env.LOGIN_PASS,
                type: "account"
            });
            token = res.data.token;
            lastLoginTime = now;
            console.log('✅ Đăng nhập thành công, token mới:', token);
        } catch (err) {
            console.error('❌ Lỗi đăng nhập:', err.response ? err.response.data : err.message);
        }
    } else {
        console.log('🔄 Sử dụng token cũ:', token);
    }
}

// 2️⃣ **Đọc danh sách thiết bị từ Excel**
function readExcel(filePath) {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);
    return data.map(row => String(row.device_id).replace(/^'/, ''));
}



// ** Đọc danh sách địa bàn từ Database **

async function readAreaFromDatabase() {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM mira_area'; // Truy vấn DB

        connection.query(query, (err, results) => {
            if (err) {
                reject('❌ Lỗi khi truy vấn cơ sở dữ liệu: ' + err);
            } else {
                // console.log('✅ Danh sách địa bàn:', results);
                resolve(results); // Trả về dữ liệu
            }
        })
    });
}

// 2️⃣ **Đọc danh sách thiết bị từ Database**
async function readDeviceFromDatabase(id_area) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM mira_device WHERE province_id = ' + id_area + ''; // Truy vấn DB

        connection.query(query, (err, results) => {
            if (err) {
                reject('❌ Lỗi khi truy vấn cơ sở dữ liệu: ' + err);
            } else {
                // console.log('✅ Danh sách thiết bị:', results);
                resolve(results); // Trả về dữ liệu
            }
        });
    });
}

// 3️⃣ **Tính thời gian chênh lệch**
function timeAgo(updatedAt) {
    const updatedTime = new Date(updatedAt);
    const now = new Date();
    const diffMs = now - updatedTime;

    if (diffMs < 60000) return `${Math.floor(diffMs / 1000)} giây`;
    if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)} phút`;
    if (diffMs < 86400000) return `${Math.floor(diffMs / 3600000)} giờ`;
    if (diffMs < 2592000000) return `${Math.floor(diffMs / 86400000)} ngày`;
    return `${Math.floor(diffMs / 2592000000)} tháng`;
}

// 4️⃣ **Gửi email cảnh báo**
async function sendAlertEmail(devices, areaId) {
    if (devices.length === 0) return;

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    let mailContent = `
    <p style="font-size: 16px; color: red;"><h1 style="color: red;">⚠️ ${areaId.name}</h1> <h2>Cảnh báo các thiết bị mất kết nối trên 5 phút:</h2></p>
    <ul style="color: black; font-size: 14px;">
`;

    devices.forEach(device => {
        mailContent += `<li> Thiết bị <strong>${device.id}</strong>: mất kết nối <strong>${device.timeDiff}</strong> trước</li>`;
    });

    mailContent += `</ul>`;

    let mailOptions = {
        from: process.env.EMAIL_USER,
        to: areaId.mail,
        subject: `${areaId.name}: ${devices.length} thiết bị mất kết nối`,
        html: mailContent // Thay vì text, dùng html
    };


    try {
        await transporter.sendMail(mailOptions);
        console.log(`📧 Đã gửi cảnh báo email cho ${devices.length} thiết bị`);
    } catch (error) {
        console.error('❌ Gửi email thất bại:', error.message);
    }
}
// 5️⃣ **Kiểm tra trạng thái thiết bị**
async function checkDevices(deviceIds, areaId) {
    console.log(`🔄 Kiểm tra thiết bị của khu vực: ${areaId.name}`);

    let offlineDevices = []; // Danh sách thiết bị mất kết nối

    for (const deviceId of deviceIds) {
        try {
            const res = await axios.get(`${SEARCH_URL}${deviceId.ID_device}`, {
                headers: { Authorization: token }
            });

            const updatedAt = res.data.updated_at;
            const timeDiff = timeAgo(updatedAt);
            const minutesDiff = (new Date() - new Date(updatedAt)) / 60000;
            const status = minutesDiff < 5 ? 'Đang kết nối' : 'Mất kết nối';

            console.log(`✅ Thiết bị ${deviceId.ID_device} trạng thái: ${status}, thời gian mới nhất: ${timeDiff}`);

            if (status === 'Mất kết nối' && minutesDiff < 720) {
                offlineDevices.push({ id: deviceId.ID_device, timeDiff });
            }
        } catch (err) {
            console.error(`❌ Lỗi khi kiểm tra thiết bị ${deviceId.ID_device}:`, err.message);
        }
    }

    // Chờ gửi email xong mới tiếp tục
    await sendAlertEmail(offlineDevices, areaId);
}

// // 6️⃣ **Cron job quét 30 phút**
// cron.schedule('*/2 * * * *', async () => {
//     console.log('🔄 Bắt đầu kiểm tra thiết bị...');
//     await loginIfNeeded();
//     const areaIds = await readAreaFromDatabase();

//     for (const areaId of areaIds) {
//         const deviceIds = await readDeviceFromDatabase(areaId.ID_area);
//         await checkDevices(deviceIds, areaId); // Chờ kiểm tra và gửi email xong mới tiếp tục
//     }

//     console.log('✅ Hoàn thành kiểm tra tất cả khu vực.');
// });

// // 7️⃣ **Chạy lần đầu**
// (async () => {
//     console.log('🚀 Chạy lần đầu...');
//     await loginIfNeeded();
//     const areaIds = await readAreaFromDatabase();

//     for (const areaId of areaIds) {
//         const deviceIds = await readDeviceFromDatabase(areaId.id_area);
//         await checkDevices(deviceIds, areaId); // Chờ kiểm tra và gửi email xong mới tiếp tục
//     }

//     console.log('🏁 Hoàn thành lần chạy đầu tiên.');
// })();

async function main() {
    // console.log(`
    //     __  __ _                  __  __ ____  ______ _  _   
    //    |  \\/  (_)                |  \\/  |  _ \\|  ____| || |  
    //    | \\  / |_ _ __ __ _ ______| \\  / | |_) | |__  | || |_ 
    //    | |\\/| | | '__/ _\` |______| |\\/| |  _ <|  __| |__   _|
    //    | |  | | | | | (_| |      | |  | | |_) | |       | |  
    //    |_|  |_|_|_|  \\__,_|      |_|  |_|____/|_|       |_|  
    //    `);

    // console.log('🚀 Chạy lần đầu...');
    await loginIfNeeded();
    const areaIds = await readAreaFromDatabase();

    for (const areaId of areaIds) {
        const deviceIds = await readDeviceFromDatabase(areaId.id_area);
        await checkDevices(deviceIds, areaId); // Chờ kiểm tra và gửi email xong newcom
    }

    // console.log('🏁 Hoàn thành lần chạy đầu tiên.');
}

cron.schedule('0 8,11,14,17 * * *', async () => {
    console.log(`
        __  __ _                  __  __ ____  ______ _  _   
       |  \\/  (_)                |  \\/  |  _ \\|  ____| || |  
       | \\  / |_ _ __ __ _ ______| \\  / | |_) | |__  | || |_ 
       | |\\/| | | '__/ _\` |______| |\\/| |  _ <|  __| |__   _|
       | |  | | | | | (_| |      | |  | | |_) | |       | |  
       |_|  |_|_|_|  \\__,_|      |_|  |_|____/|_|       |_|  
       `);

    console.log('🔄 Bắt đầu kiểm tra thiết bị...');
    main();
    console.log('✅ Hoàn thành kiểm tra tất cả khu vực.');
    console.log('**********************************************************************************');
});

// (async () => {
//     main();
// })();