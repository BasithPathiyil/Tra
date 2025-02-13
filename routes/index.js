const express = require("express");
const userRoute = require("./user.route");
const fileUploadRoute = require("./fileupload.route");
const nseRoute = require("./nse.route");
const router = express.Router();

router.use("/user", userRoute);
router.use("/file_upload", fileUploadRoute);
router.use("/nse", nseRoute);

module.exports = router;
