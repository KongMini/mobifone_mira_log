const cron = require('node-cron');
const { checkAllDevices } = require('../controllers/deviceController');


function startCronJob() {
    console.log("Cronjob start: 07:30" + new Date());
    cron.schedule('30 7 * * *', async () => {
        console.log('⏳ Đang chạy cron job kiểm tra thiết bị...');
        await checkAllDevices();
        console.log('✅ Cron job hoàn tất.' + new Date());
    });
}

module.exports = { startCronJob };
