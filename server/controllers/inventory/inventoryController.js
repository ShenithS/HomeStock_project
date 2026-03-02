const Inventory = require("../../models/inventory/inventoryModel");

// Fetch all inventory items
exports.getInventory = async (req, res) => {
  try {
    const items = await Inventory.find().sort({ createdAt: -1 });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: "Error fetching inventory", error });
  }
};

// Get low stock items
exports.getLowStockItems = async (req, res) => {
  try {
    const items = await Inventory.find({
      $or: [
        { status: "Low Stock", "lowStockAlert.acknowledged": false },
        { status: "Out of Stock" },
      ],
    }).sort({ quantity: 1 });

    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: "Error fetching low stock items", error });
  }
};

// Add new inventory item
exports.addItem = async (req, res) => {
  try {
    // Validate required fields
    const requiredFields = [
      "itemNumber",
      "name",
      "category",
      "quantity",
      "manufactureDate",
      "expiryDate",
      "temperature",
    ];

    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ message: `${field} is required` });
      }
    }

    // Check for duplicate item number
    const existingItem = await Inventory.findOne({
      itemNumber: req.body.itemNumber,
    });
    if (existingItem) {
      return res.status(400).json({ message: "Item number already exists" });
    }

    const itemData = {
      ...req.body,
      manufactureDate: new Date(req.body.manufactureDate),
      expiryDate: new Date(req.body.expiryDate),
      quantity: Number(req.body.quantity),
      threshold: req.body.threshold || 10, // Default threshold
    };

    const newItem = new Inventory(itemData);
    await newItem.save();

    res.status(201).json(newItem);
  } catch (error) {
    console.error("Error adding item:", error);
    res.status(500).json({
      message: "Error adding item",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// Update existing inventory item
exports.updateItem = async (req, res) => {
  try {
    const updates = {
      ...req.body,
      manufactureDate: req.body.manufactureDate
        ? new Date(req.body.manufactureDate)
        : undefined,
      expiryDate: req.body.expiryDate
        ? new Date(req.body.expiryDate)
        : undefined,
      quantity: req.body.quantity ? Number(req.body.quantity) : undefined,
    };

    const updatedItem = await Inventory.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: "Error updating item", error });
  }
};

// Delete inventory item
exports.deleteItem = async (req, res) => {
  try {
    const deletedItem = await Inventory.findByIdAndDelete(req.params.id);
    if (!deletedItem) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting item", error });
  }
};

// Acknowledge single low stock item
exports.acknowledgeItem = async (req, res) => {
  try {
    const updatedItem = await Inventory.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          "lowStockAlert.acknowledged": true,
          "lowStockAlert.acknowledgedAt": new Date(),
          "lowStockAlert.acknowledgedBy": req.user._id, // Assuming you have user auth
        },
      },
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: "Error acknowledging item", error });
  }
};

// Acknowledge all low stock items
exports.acknowledgeAllItems = async (req, res) => {
  try {
    const result = await Inventory.updateMany(
      {
        status: "Low Stock",
        "lowStockAlert.acknowledged": false,
      },
      {
        $set: {
          "lowStockAlert.acknowledged": true,
          "lowStockAlert.acknowledgedAt": new Date(),
          "lowStockAlert.acknowledgedBy": req.user._id,
        },
      }
    );

    res.status(200).json({
      message: `Acknowledged ${result.nModified} low stock items`,
      acknowledgedCount: result.nModified,
    });
  } catch (error) {
    res.status(500).json({ message: "Error acknowledging all items", error });
  }
};
