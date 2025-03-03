const axios = require('axios');
const { login } = require('../controllers/authController');
const { timeAgo } = require('../utils/timeAgo');


const SEARCH_URL = 'https://mira-admin.smatec.com.vn/admin/devices/';

async function checkDevices(deviceIds, area) {
    const token = await login();
    console.log('token', token);
    console.log(" Kiểm tra thiết bị khu vực ", area.name);
    let offlineDevices = [];
    let offlineDevicesLong = [];

    for (const device of deviceIds) {
        try {
            const res = await axios.get(`${SEARCH_URL}${device.ID_device}`, {
                headers: { Authorization: token }
            });

            const updatedAt = new Date(res.data.updated_at);
            const timeDiff = timeAgo(updatedAt);
            const now = new Date();
            const minutesDiff = (now - updatedAt) / 60000;
            const status = minutesDiff < 5 ? 'Đang kết nối' : 'Mất kết nối';

            let location = '';
            if (device.area) { location += device.area + ' - '; }
            if (device.ward) { location += device.ward + ' - '; }
            if (device.district) { location += device.district + ' - '; }
            if (device.province) { location += device.province; }

            console.log(`✅ Thiết bị ${device.ID_device} trạng thái: ${status}, thời gian mới nhất: ${timeDiff}`);

            if (status === 'Mất kết nối') {
                const data = { id: device.ID_device, timeDiff: timeDiff, location: location };
                minutesDiff < 720 ? offlineDevices.push(data) : offlineDevicesLong.push(data);
            }
        } catch (err) {
            console.error(`❌ Lỗi kiểm tra thiết bị ${device.ID_device}:`, err.message);
        }
    }

    return { offlineDevices, offlineDevicesLong };
}

module.exports = { checkDevices };
