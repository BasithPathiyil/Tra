const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/uploads/");
  },
  filename: (req, file, cb) => {
    const originalname = file.originalname;
    const extension = originalname.slice(
      ((originalname.lastIndexOf(".") - 1) >>> 0) + 2
    );
    cb(null, `${Date.now()}.${extension}`);
  },
});

const upload = multer({ storage });

module.exports = {
  upload,
};
