const { userService } = require("../services");
const { tryCatch } = require("../utils/tryCatch");

const register = tryCatch(async (req, res, next) => {
  const newUser = await userService.registerUser(req.body);
  res.status(200).json({
    status: true,
    statuscode: 200,
    message: "User registered successfully",
  });
});

const login = tryCatch(async (req, res, next) => {
  const { username, password } = req.body;
  const newUser = await userService.login(username, password);
  res.status(200).json({
    status: true,
    statuscode: 200,
    message: "Loginsuccesfull",
    user: newUser.user,
    token: newUser.token,
  });
});

module.exports = {
  register,
  login,
};
