const mongoose = require("mongoose");

const BarcodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }, // Add timestamp
});

module.exports = mongoose.model("Barcode", BarcodeSchema);
