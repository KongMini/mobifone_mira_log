const nodemailer = require('nodemailer');
const ntlmAuth = require('nodemailer-ntlm-auth');

async function sendAlertEmail(offlineDevices, offlineDevicesLong, area) {
    if (offlineDevices.length === 0) return;

    // Sent mail by personal mail
    // let transporter = nodemailer.createTransport({
    //     service: 'gmail',
    //     auth: {
    //         user: process.env.EMAIL_USER,
    //         pass: process.env.EMAIL_PASS
    //     }
    // });

    // Sent mail by company mail
    let transporter = nodemailer.createTransport({
        host: process.env.EMAIL_COMPANY_HOST,
        port: Number(process.env.EMAIL_COMPANY_PORT),
        secure: process.env.EMAIL_COMPANY_SECURE === "true",
        auth: {
            type: process.env.EMAIL_COMPANY_AUTH_TYPE,
            method: process.env.EMAIL_COMPANY_AUTH_METHOD,
            domain: process.env.EMAIL_COMPANY_AUTH_DOMAIN,
            workstation: process.env.EMAIL_COMPANY_AUTH_WORKSTATION,
            user: process.env.EMAIL_COMPANY_AUTH_USER,
            pass: process.env.EMAIL_COMPANY_AUTH_PASS
        },
        customAuth: {
            NTLM: ntlmAuth
        },
        tls: {
            rejectUnauthorized: false
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
        from: '"BC SXKD CTY4" <noreply.it4@mobifone.vn>',
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
