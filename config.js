'use_strict';

require('dotenv').config()
const
    SERVER_HOSTNAME = process.env.SERVER_HOSTNAME || 'localhost',
    SERVER_PORT = process.env.SERVER_PORT || 3000,
    SERVER = {
        hostname: SERVER_HOSTNAME,
        port: SERVER_PORT
    },
    // DB = process.env.DB_URL,
    DB = 'mongodb://localhost/bookstore_local',    
    config = {
        server: SERVER,
        database: DB
    };

module.exports = config;