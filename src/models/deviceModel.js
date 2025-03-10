const createConnection = require('../config/database');

async function getAreas() {
    const connection = await createConnection();
    const [results] = await connection.execute('SELECT * FROM mira_area ORDER BY id DESC');
    await connection.end();
    return results;
}

async function getDevicesByArea(id_area) {
    const connection = await createConnection();
    const query = `
        SELECT a.*, b.name AS province, c.name AS district, d.name AS ward, e.name AS area
        FROM mira_device a
        LEFT JOIN mira_area_all b ON b.id_area = a.province_id
        LEFT JOIN mira_area_district c ON c.id_area = a.district_id
        LEFT JOIN mira_area_ward d ON d.id_area = a.ward_id
        LEFT JOIN mira_area_area e ON e.id_area = a.area_id
        WHERE a.province_id = ?`;
    const [results] = await connection.execute(query, [id_area]);
    await connection.end();
    return results;
}

module.exports = { getAreas, getDevicesByArea };