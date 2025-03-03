const AppError = require("../middlewares/AppError");
const settings = require("../models/settings.model");
const User = require("../models/user.model");

const updateSettings = async (body) => {
  const isTypeExist = await getSettingsType(body.type);
  if (isTypeExist) {
    isTypeExist.value = body.value;
    // await isTypeExist.save();
    return await settings.updateOne({ type: body.type }, body);
  }
  return await settings.create(body);
};

const getSettings = async (body) => {
  return await settings.find();
};
//
const getSettingsType = async (type) => {
  return settings.findOne({ type });
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
  updateSettings,
  getSettings,
};
