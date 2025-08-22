const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "src/assets/uploads"); // make sure 'uploads' folder exists in project root
  },
  filename: function (req, file, callback) {
    callback(null, Date.now() + "-" + file.originalname); // unique name
  }
});

const upload = multer({ storage });
module.exports = upload;
