const express = require("express");
const Barcode = require("../../models/iot/Barcode");

const router = express.Router();

// POST route for inserting a barcode
router.post("/scan", async (req, res) => {
  try {
    const { barcode } = req.body;

    if (!barcode || barcode.trim() === "") {
      return res
        .status(400)
        .json({ message: "❌ Barcode cannot be null or empty" });
    }

    // Check if barcode already exists
    const existingBarcode = await Barcode.findOne({ code: barcode });
    if (existingBarcode) {
      return res.status(409).json({ message: "❌ Barcode already exists" });
    }

    // Insert barcode with timestamp
    const newBarcode = new Barcode({ code: barcode });
    await newBarcode.save();

    res.status(201).json({
      message: "✅ Barcode saved successfully",
      barcode,
      createdAt: newBarcode.createdAt,
    });
  } catch (err) {
    console.error("❌ Backend Error:", err);
    res
      .status(500)
      .json({ message: "❌ Internal Server Error", error: err.message });
  }
});

// GET route for retrieving all barcodes
router.get("/barcodes", async (req, res) => {
  try {
    const barcodes = await Barcode.find().sort({ createdAt: -1 }); // Sort by latest first
    if (barcodes.length === 0) {
      return res.status(404).json({ message: "❌ No barcodes found" });
    }

    res
      .status(200)
      .json({ message: "All barcodes retrieved successfully", barcodes });
  } catch (err) {
    console.error("❌ Error retrieving barcodes:", err);
    res
      .status(500)
      .json({ message: "Error retrieving barcodes", error: err.message });
  }
});
router.delete("/barcodes/:id", async (req, res) => {
  try {
    const barcode = await Barcode.findByIdAndDelete(req.params.id);

    if (!barcode) {
      return res.status(404).json({ message: "Barcode not found" });
    }

    res.status(200).json({ message: "Barcode deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting barcode:", err);
    res.status(500).json({ message: "Error deleting barcode", error: err });
  }
});
router.put("/barcodes/:id", async (req, res) => {
  try {
    const { code } = req.body;

    if (!code || code.trim() === "") {
      return res.status(400).json({ message: "Barcode cannot be empty" });
    }

    // Check if new barcode already exists (excluding current one)
    const existingBarcode = await Barcode.findOne({
      code,
      _id: { $ne: req.params.id },
    });
    if (existingBarcode) {
      return res.status(409).json({ message: "Barcode already exists" });
    }

    const updatedBarcode = await Barcode.findByIdAndUpdate(
      req.params.id,
      { code },
      { new: true }
    );

    if (!updatedBarcode) {
      return res.status(404).json({ message: "Barcode not found" });
    }

    res.status(200).json({
      message: "Barcode updated successfully",
      barcode: updatedBarcode,
    });
  } catch (err) {
    console.error("Error updating barcode:", err);
    res.status(500).json({ message: "Error updating barcode", error: err });
  }
});
module.exports = router;
