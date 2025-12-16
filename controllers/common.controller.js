const { commonService } = require("../services");
const { tryCatch } = require("../utils/tryCatch");

const fetchAnyApi = tryCatch(async (req, res, next) => {
  let result = await commonService.fetchAnyApi(req.query.url);
  res.status(200).json({
    status: true,
    statuscode: 200,
    message: "all files fetched Successfully",
    result,
  });
});

module.exports = {
  fetchAnyApi,
};
