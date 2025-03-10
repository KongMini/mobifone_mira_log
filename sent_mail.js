const nodemailer = require('nodemailer');
const ntlmAuth = require('nodemailer-ntlm-auth');

let transporter = nodemailer.createTransport({
    host: "10.3.12.28",
    port: 25,
    secure: false,
    auth: {
        type: 'custom',
        method: 'NTLM',
        domain: 'MOBIFONE',
        workstation: 'CT4-CNS-CONGPV',
        user: 'noreply.it4@mobifone.vn',
        pass: 'Cnkt@2023'
    },
    customAuth: {
        NTLM: ntlmAuth
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Gửi email
async function sendMail() {
    try {
        let info = await transporter.sendMail({
            from: '"BC SXKD CTY4" <noreply.it4@mobifone.vn>',
            to: "cong.phungvan@mobifone.vn", // Thay bằng email người nhận
            subject: "Test Email",
            text: "Nội dung email gửi bằng Nodemailer",
            html: "<b>Nội dung email gửi bằng Nodemailer</b>"
        });

        console.log("Email sent: " + info.messageId);
    } catch (error) {
        console.error("Error sending email:", error);
    }
}

// Chạy hàm gửi email
sendMail();
