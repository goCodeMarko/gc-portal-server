require('dotenv').config();

const SERVER = {
    hostname:   process.env.SERVER_HOSTNAME || 'localhost',
    port:       process.env.SERVER_PORT     || 3000
};
const CLOUDINARY = {
    name:       process.env.CLOUDINARY_CLOUD_NAME,
    key:        process.env.CLOUDINARY_API_KEY,
    secret:     process.env.CLOUDINARY_API_SECRET
}
const DB = process.env.DB_URL || 'mongodb://localhost/bookstore_local';  



const config = {
    server:     SERVER,
    database:   DB,
    cloudinary: CLOUDINARY
};

module.exports = config;