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

module.exports = {
  updateSettings,
};
