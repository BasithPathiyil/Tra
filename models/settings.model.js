const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {},
  {
    strict: false,
    timestamps: true,
  }
);
const settings = mongoose.model("settings", settingsSchema);

module.exports = settings;
