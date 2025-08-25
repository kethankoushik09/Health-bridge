const multer = require("multer");
const path = require("path");


const storage = multer.diskStorage({
  filename: function (req, file, callback) {
    callback(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });
module.exports = upload;
