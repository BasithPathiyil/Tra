const { userService, settingsService } = require("../services");
const { tryCatch } = require("../utils/tryCatch");

const updateSettings = tryCatch(async (req, res, next) => {
  const newUser = await settingsService.updateSettings(req.body);
  res.status(200).json({
    status: true,
    statuscode: 200,
    message: "User registered successfully",
  });
});

const getSettings = tryCatch(async (req, res, next) => {
  let { page, rowsPerPage } = req.query;
  let result = await settingsService.getSettings(req.query);
  res.status(200).json({
    status: true,
    statuscode: 200,
    message: "all files fetched Successfully",
    result,
  });
});

module.exports = {
  updateSettings,
  getSettings,
};
