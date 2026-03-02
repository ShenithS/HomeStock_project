const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: String,
    category: String,
    temperature: Number,
    humidity: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
