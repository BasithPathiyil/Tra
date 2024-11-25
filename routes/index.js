const express = require("express");
const userRoute = require("./user.route");
const fileUploadRoute = require("./fileupload.route");
const router = express.Router();

router.use("/user", userRoute);
router.use("/file_upload", fileUploadRoute);

module.exports = router;
