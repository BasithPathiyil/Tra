const mongoose = require("mongoose");

const firstfiveSchema = new mongoose.Schema(
  {},
  {
    strict: false, // Allows saving fields that are not defined in the schema
    timestamps: true, // Automatically manage createdAt and updatedAt fields
  }
);
const firstFive = mongoose.model("firstFive", firstfiveSchema);

module.exports = firstFive;
