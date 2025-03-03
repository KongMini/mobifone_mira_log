const axios = require('axios');
require('dotenv').config();

const LOGIN_URL = 'https://mira-admin.smatec.com.vn/admin/login';
let token = '';

async function login() {
    try {
        const res = await axios.post(LOGIN_URL, {
            username: process.env.LOGIN_USER,
            password: process.env.LOGIN_PASS,
            type: "account"
        });
        token = res.data.token;
        console.log('✅ Đăng nhập thành công, token mới:', token);
        return token;
    } catch (err) {
        console.error('❌ Lỗi đăng nhập:', err.response ? err.response.data : err.message);
    }
}


module.exports = { login };