require("dotenv").config();

const SERVER = {
  hostname: process.env.HOST || "localhost",
  port: process.env.PORT || 3001,
};
const CLOUDINARY = {
  name: process.env.CLOUDINARY_CLOUD_NAME,
  key: process.env.CLOUDINARY_API_KEY,
  secret: process.env.CLOUDINARY_API_SECRET,
};

const DB = "mongodb://localhost:27017/gc-portal"; //process.env.ATLAS_URI;

const config = {
  server: SERVER,
  database: DB,
  cloudinary: CLOUDINARY,
  NODE_ENV: process.env.NODE_ENV,
};

module.exports = config;
