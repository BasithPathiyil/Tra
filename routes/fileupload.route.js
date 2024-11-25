const express = require("express");
const { fileUploadController } = require("../controllers");
const { auth } = require("../middlewares/auth");

const router = express.Router();

router.post("/upload", auth, fileUploadController.fileUpload);
router.delete("/delete", auth, fileUploadController.removeFile);
router.get(
  "/get_all_files_by_userid",
  auth,
  fileUploadController.getAllFilesByUserId
);
router.get("/get_file", auth, fileUploadController.getFile);
router.get("/stockdata", fileUploadController.getStockGraphData);
module.exports = router;
