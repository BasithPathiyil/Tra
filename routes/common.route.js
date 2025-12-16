const express = require("express");
const { commonContoller } = require("../controllers");

const router = express.Router();

router.get("/fetch-api", commonContoller.fetchAnyApi);

module.exports = router;
