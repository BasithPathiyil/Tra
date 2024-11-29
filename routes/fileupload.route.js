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
router.get("/stockdata10", fileUploadController.getStock10timesData);
router.get("/stockdata1", fileUploadController.getEquityStockIndices);
router.get("/stockdata2", fileUploadController.getStockCustomizeForAto);
module.exports = router;
