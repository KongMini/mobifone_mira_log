const nodemailer = require('nodemailer');
require('dotenv').config();

let transporter = nodemailer.createTransport({
    host: "mail.mobifone.vn", // SMTP Server
    port: 587, // Cổng SMTP (587 cho STARTTLS, 465 cho SSL)
    secure: false, // false = STARTTLS, true = SSL
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false // Nếu có lỗi chứng chỉ SSL
    }
});

let mailOptions = {
    from: process.env.EMAIL_USER,
    to: "cong.phungvan@mobifone.vn",
    subject: "Test email từ Node.js",
    text: "Xin chào, đây là email thử nghiệm từ hệ thống!"
};

transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        console.error("❌ Gửi email thất bại:", error);
    } else {
        console.log("📧 Email đã được gửi:", info.response);
    }
});
