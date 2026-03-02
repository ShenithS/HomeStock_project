const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    itemNumber: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 },
    manufactureDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true },
    temperature: { type: String, required: true },
    status: {
      type: String,
      enum: ["Available", "Low Stock", "Out of Stock", "Expired"],
      default: "Available",
    },
    lowStockAlert: {
      isActive: { type: Boolean, default: false },
      acknowledged: { type: Boolean, default: false },
      acknowledgedAt: { type: Date },
      acknowledgedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    threshold: { type: Number, default: 10 }, // Default low stock threshold
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Update status based on quantity and expiry date
inventorySchema.pre("save", function (next) {
  const now = new Date();

  // Check expiry first
  if (this.expiryDate <= now) {
    this.status = "Expired";
  }
  // Then check quantity
  else if (this.quantity <= 0) {
    this.status = "Out of Stock";
  } else if (this.quantity <= this.threshold) {
    this.status = "Low Stock";
    this.lowStockAlert.isActive = true;
    this.lowStockAlert.acknowledged = false;
  } else {
    this.status = "Available";
    this.lowStockAlert.isActive = false;
  }

  next();
});

const Inventory = mongoose.model("Inventory", inventorySchema);

module.exports = Inventory;
