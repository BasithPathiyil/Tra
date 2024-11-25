const AppError = require("../middlewares/AppError");
const User = require("../models/user.model");

const registerUser = async (userBody) => {
  const isUsernameExist = await getUserByUsername(userBody.username);
  if (isUsernameExist) {
    throw new AppError(409, "Username already exists");
  }
  return User.create(userBody);
};
//
const getUserByUsername = async (username) => {
  return User.findOne({ username }).select("+password");
};

const login = async (username, password) => {
  const user = await getUserByUsername(username);
  if (!user) {
    throw new AppError(401, "Username not found");
  }
  const isPasswordCorrect = await user.matchPassword(password);
  if (!isPasswordCorrect) {
    throw new AppError(401, "Incorrect password");
  }
  const token = user.getSignedJwtToken();

  return { user, token };
};

module.exports = {
  registerUser,
  getUserByUsername,
  login,
};
