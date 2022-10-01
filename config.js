require('dotenv').config();

const SERVER = {
    hostname:   process.env.HOST || 'localhost',
    port:       process.env.PORT || 3000
};
const CLOUDINARY = {
    name:       process.env.CLOUDINARY_CLOUD_NAME,
    key:        process.env.CLOUDINARY_API_KEY,
    secret:     process.env.CLOUDINARY_API_SECRET
}
const DB = process.env.MONGODB  || 'mongodb://localhost/bookstore_local'
const TYPE = process.env.TYPE   || 'local'

const config = {
    server: SERVER,
    database: DB,
    cloudinary: CLOUDINARY,
    type: TYPE
};

module.exports = config;