require('dotenv').config();
const axios = require('axios');
const mysql = require('mysql2/promise'); // Sử dụng promise cho async/await

// Kết nối đến MySQL
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'mira_log'
};

const API_URL = 'https://mira-admin.smatec.com.vn/admin/devices?mgw_id=&name=&fvers=&area_path=3682&server=&state=0&offset=0&limit=2000';
const API_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NDA3MzI0MjYsImlhdCI6MTc0MDY0NjAyNiwiaWQiOiJqcnpwZTJlaDEwbWF1eXkwdGJ1IiwiaXNzIjoibWlyYXYzIiwicm9sZSI6Iiw2MCw2Miw4MCwifQ.DYnmd9-uz9lgd0XMN1J2w44SDNdNxdbVbJqL86S8k6I';

async function fetchAndInsertData() {
    // try {
    console.log('📡 Đang lấy dữ liệu từ API...');
    const response = await axios.get(API_URL, {
        headers: { Authorization: API_TOKEN },
        timeout: 30000 // ⏳ Chờ tối đa 30 giây (30,000 ms)
    });

    if (!response.data) {
        console.error('❌ Dữ liệu API không hợp lệ!');
        return;
    }
    console.log('✅ Dữ liệu API hợp lệ!');
    // console.log(response.data);
    // return;
    const devices = response.data.items;
    console.log(`✅ Lấy được ${devices.length} thiết bị từ API`);

    const connection = await mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "mira_log",
    });

    for (const device of devices) {
        const id = device.ext_id;
        const name = device.ext_id;
        const vcode = device.vcode;
        const area_path = device.area_path;
        const last_update_time = device.updated_at;
        const state = device.state;

        let province_id = '';
        let district_id = '';
        let ward_id = '';
        let area_id = '';
        // Chuẩn hóa: Bỏ dấu phẩy đầu/cuối, tách thành mảng, rồi chuyển thành số
        const resultArray = device.area_path
            .replace(/^,|,$/g, '') // Loại bỏ dấu phẩy đầu/cuối
            .split(',')             // Tách thành mảng
            .map(Number);           // Chuyển từng phần tử thành số
        // console.log(device.ext_id);
        if (resultArray[1]) {
            province_id = resultArray[1];
        }
        if (resultArray[2]) {
            district_id = resultArray[2];
        }
        if (resultArray[3]) {
            ward_id = resultArray[3];
        }
        if (resultArray[4]) {
            area_id = resultArray[4];
        }
        // return;
        // Kiểm tra nếu thiết bị đã tồn tại
        const [rows] = await connection.execute(
            'SELECT ID FROM mira_device WHERE ID_device = ?',
            [id]
        );
        // console.log(rows);
        // return;
        if (rows.length === 0) {
            // Chèn thiết bị mới vào DB
            await connection.execute(
                'INSERT INTO mira_device (ID_device, name, vcode, local, status, province_id, district_id, ward_id, area_id, date_update) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [id, name, vcode, area_path, state, province_id, district_id, ward_id, area_id, last_update_time]
            );
            console.log(`🆕 Đã thêm thiết bị: ${id}`);
        } else {
            console.log(`🔄 Thiết bị ${id} đã tồn tại, bỏ qua.`);
        }

    }

    await connection.end();
    console.log('✅ Dữ liệu đã được cập nhật vào database!');
    // } catch (error) {
    //     if (error.code === 'ECONNABORTED') {
    //         console.error('⏳ API timeout! Chờ phản hồi quá lâu.');
    //     } else {
    //         console.error('❌ Lỗi khi lấy hoặc insert dữ liệu:', error.message);
    //     }
    // }
}

// Chạy function một lần
fetchAndInsertData();
