const mysql = require('mysql2/promise');
require('./dotenv');

async function connect() {
    const connection = mysql.createConnection({
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME
    })
    console.log("Connected to MySQL database.");
    return connection;
}

module.exports = connect;