const mongoose = require("mongoose");

// Define a fully dynamic schema
const preOpenMarketSchema = new mongoose.Schema(
  {},
  {
    strict: false, // Allows saving fields that are not defined in the schema
    timestamps: true, // Automatically manage createdAt and updatedAt fields
  }
);

// Compile the schema into a model
const PreopenMarket = mongoose.model("PreopenMarket", preOpenMarketSchema);

module.exports = PreopenMarket;
