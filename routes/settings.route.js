const express = require("express");
const { settingsContoller } = require("../controllers");

const router = express.Router();

router.put("/update-settings", settingsContoller.updateSettings);
router.get("/get-settings", settingsContoller.getSettings);

module.exports = router;
