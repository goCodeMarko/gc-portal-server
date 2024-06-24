const multer = require("multer"),
  path = require("path");

module.exports = multer({
  storage: multer.diskStorage({}),
  limits: { fileSize: 100 * 1024 * 1024 }, // 50 MB
  fileFilter: (req, file, callback) => {
    callback(null, true);
  },
});
