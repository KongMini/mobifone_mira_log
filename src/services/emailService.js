const nodemailer = require('nodemailer');

async function sendAlertEmail(offlineDevices, offlineDevicesLong, area) {
    if (offlineDevices.length === 0) return;

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    let content = `<h2>Cảnh báo thiết bị mất kết nối tại ${area.name}</h2><ul>`;
    offlineDevices.forEach(
        device => content += `<li> Thiết bị <strong>${device.id} (${device.location})</strong>: mất kết nối <strong>${device.timeDiff}</strong> trước</li>`
    );
    content += `<li> ---------------------------------------------------------------------------------</li>`;
    content += `<h2>Cảnh báo các thiết bị mất kết nối lâu hơn 1 ngày:</h2>`;

    offlineDevicesLong.forEach(device => {
        content += `<li> Thiết bị <strong>${device.id} (${device.location})</strong>: mất kết nối <strong>${device.timeDiff}</strong> trước</li>`;
    });
    content += `</ul>`;
    content += `<p style="font-size: 16px; color: blue; font-weight: bold">Vui lòng kiểm tra trạng thái thiết bị, và Xử lý kịp thời</p>`;

    let mailOptions = {
        from: process.env.EMAIL_USER,
        to: area.mail,
        subject: `TTTM - ${area.name}: Cảnh báo thiết bị mất kết nối`,
        html: content
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`📧 Đã gửi cảnh báo email`);
    } catch (error) {
        console.error('❌ Gửi email thất bại:', error.message);
    }
}

module.exports = { sendAlertEmail };
