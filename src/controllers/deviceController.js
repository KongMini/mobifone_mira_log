const { getAreas, getDevicesByArea } = require('../models/deviceModel');
const { checkDevices } = require('../services/deviceService');
const { sendAlertEmail } = require('../services/emailService');

async function checkAllDevices() {
    console.log(`
        __  __ _                  __  __ ____  ______ _  _   
       |  \\/  (_)                |  \\/  |  _ \\|  ____| || |  
       | \\  / |_ _ __ __ _ ______| \\  / | |_) | |__  | || |_ 
       | |\\/| | | '__/ _\` |______| |\\/| |  _ <|  __| |__   _|
       | |  | | | | | (_| |      | |  | | |_) | |       | |  
       |_|  |_|_|_|  \\__,_|      |_|  |_|____/|_|       |_|  
       `);
    console.log('🔄 Bắt đầu kiểm tra thiết bị...');
    // try {
    const areas = await getAreas();
    for (const area of areas) {
        const devices = await getDevicesByArea(area.id_area);
        const { offlineDevices, offlineDevicesLong } = await checkDevices(devices, area);
        await sendAlertEmail(offlineDevices, offlineDevicesLong, area);
    }
    console.log('✅ Hoàn thành kiểm tra tất cả khu vực.');
    console.log('**********************************************************************************');
    // } catch (error) {
    //     console.error('❌ Kiem tra thiet bi that bai:', error.message);
    // }
}

module.exports = { checkAllDevices };
