const cron = require('node-cron');
const { checkAllDevices } = require('../controllers/deviceController');

function startCronJob() {
    cron.schedule('0 7 * * *', async () => {
        console.log('⏳ Đang chạy cron job kiểm tra thiết bị...');
        await checkAllDevices();
        console.log('✅ Cron job hoàn tất.');
    });
}

module.exports = { startCronJob };
