const express = require("express");
const { nseContoller } = require("../controllers");

const router = express.Router();

router.get("/getMarketStatus", nseContoller.getMarketStatus);

module.exports = router;
