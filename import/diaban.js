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

const API_URL = 'https://mira-admin.smatec.com.vn/admin/areas?offset=0&limit=20000';
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
    const locations = response.data.items;
    console.log(`✅ Lấy được ${locations.length} thiết bị từ API`);

    const connection = await mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "mira_log",
    });

    // Lấy địa bản tỉnh trong database
    const [locations_province] = await connection.execute(
        'SELECT * FROM mira_area_ward'
    );

    // lấy id_area chuyển vào mảng để phục vụ kiểm tra
    const locations_province_id = locations_province.map(location => location.id_area);
    console.log(locations_province_id);
    // return;
    for (const location of locations) {
        const id_area = location.id;
        const parent_id = Number(location.parent_id);
        const area_type_id = location.area_type_id;
        const code = location.code;
        const name = location.name;
        const status = location.status;

        if (!locations_province_id.includes(parent_id)) {
            console.log(`🚫 Địa bàn ${name} khóa parent id - ${parent_id}, bỏ qua.`);
            continue;
        }

        if (area_type_id !== '4') {
            console.log(`🚫 Địa bàn ${name} khóa area_type_id - ${area_type_id}, bỏ qua.`);
            continue;
        }
        console.log(`🆕 Parent_id: ${parent_id}`);
        // Kiểm tra nếu vị trí đã tồn tại
        const [rows] = await connection.execute(
            'SELECT id_area FROM mira_area_area WHERE id_area = ?',
            [id_area]
        );
        if (rows.length === 0) {
            // Chèn thiết bị mới vào DB
            await connection.execute(
                'INSERT INTO mira_area_area (id_area, parent_id, area_type_id, code, name, status ) VALUES (?, ?, ?, ?, ?, ?)',
                [id_area, parent_id, area_type_id, code, name, status]
            );
            console.log(`🆕 Đã thêm địa bàn: ${name}`);
        } else {
            console.log(`🔄 Địa bàn ${name} đã tồn tại, bỏ qua.`);
        }

    }

    await connection.end();
    console.log('✅ Dữ liệu đã được cập nhật vào database!');

}

// Chạy function một lần
fetchAndInsertData();
