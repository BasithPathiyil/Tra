const express = require("express");
const userRoute = require("./user.route");
const fileUploadRoute = require("./fileupload.route");
const nseRoute = require("./nse.route");
const settingsRoute = require("./settings.route");
const router = express.Router();

router.use("/user", userRoute);
router.use("/file_upload", fileUploadRoute);
router.use("/nse", nseRoute);
router.use("/settings", settingsRoute);

module.exports = router;
