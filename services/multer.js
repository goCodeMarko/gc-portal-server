const multer = require("multer"),
  path = require("path");

module.exports = multer({
  storage: multer.diskStorage({}),
  fileFilter: (req, file, callback) => {
    callback(null, true);
  },
});
