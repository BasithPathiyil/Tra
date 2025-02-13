const { nseService } = require("../services");
const { tryCatch } = require("../utils/tryCatch");

const getMarketStatus = tryCatch(async (req, res, next) => {
  let { page, rowsPerPage } = req.query;
  let result = await nseService.getMarketStatus(req.query);
  res.status(200).json({
    status: true,
    statuscode: 200,
    message: "all files fetched Successfully",
    result,
  });
});

module.exports = {
  getMarketStatus,
};
