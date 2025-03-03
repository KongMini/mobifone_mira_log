// test checkDevices
// import
// const { getAreas, getDevicesByArea } = require('./models/deviceModel.js');
// const { checkDevices } = require('./services/deviceService');
// const { sendAlertEmail } = require('./services/emailService');
// // const { login } = require('./controllers/authController');

// async function mainCheckDevices() {

//     // const token = await login();
//     // console.log('token', token);

//     // get all areas
//     const areas = await getAreas();
//     for (const area of areas) {
//         console.log(area.name);
//         const devices = await getDevicesByArea(area.id_area);
//         // console.log(devices.province, devices.district);
//         // for (const device of devices) {
//         // console.log(device);
//         const { offlineDevices, offlineDevicesLong } = await checkDevices(devices, area);

//         await sendAlertEmail(offlineDevices, offlineDevicesLong, area);
//         // }
//     }

// }

// mainCheckDevices();


// test device controller
const { checkAllDevices } = require('./controllers/deviceController');
checkAllDevices();