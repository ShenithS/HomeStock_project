const Grocery = require("../../models/GroceryModel/Grocery");

// Utility function for error handling
const handleError = (res, error, status = 500, message = null) => {
  console.error(error);
  res.status(status).json({
    message: message || error.message,
    error: process.env.NODE_ENV === "development" ? error.stack : undefined,
  });
};

// Get all non-archived groceries with filtering options
exports.getAllGroceries = async (req, res) => {
  try {
    const { category, completed } = req.query;
    const query = { archived: false };

    if (category) query.category = category;
    if (completed !== undefined) query.completed = completed === "true";

    const groceries = await Grocery.find(query).sort({
      dateAdded: -1,
      completed: 1,
    });

    res.json(groceries);
  } catch (err) {
    handleError(res, err);
  }
};

// Get all archived groceries with optional date range
exports.getArchivedGroceries = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { archived: true };

    if (startDate || endDate) {
      query.updatedAt = {};
      if (startDate) query.updatedAt.$gte = new Date(startDate);
      if (endDate) query.updatedAt.$lte = new Date(endDate);
    }

    const groceries = await Grocery.find(query)
      .sort({ updatedAt: -1 })
      .limit(100); // Prevent excessive data loading

    res.json(groceries);
  } catch (err) {
    handleError(res, err);
  }
};

// Add new grocery item with validation
exports.addGrocery = async (req, res) => {
  try {
    const { name, quantity, category } = req.body;

    // Validation
    if (!name || !quantity) {
      return res
        .status(400)
        .json({ message: "Name and quantity are required" });
    }

    if (typeof quantity !== "number" || quantity <= 0) {
      return res
        .status(400)
        .json({ message: "Quantity must be a positive number" });
    }

    const newGrocery = new Grocery({
      name: name.trim(),
      quantity,
      category: category || "Uncategorized",
      dateAdded: new Date(),
    });

    const savedGrocery = await newGrocery.save();
    res.status(201).json(savedGrocery);
  } catch (err) {
    handleError(res, err, 400);
  }
};

// Update grocery item with validation
exports.updateGrocery = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Don't allow updating these fields directly
    delete updates._id;
    delete updates.dateAdded;
    delete updates.archived;

    // If marking as completed, set archived to true after 24 hours
    if (updates.completed === true) {
      updates.archived = true;
      updates.datePurchased = new Date();
    }

    const grocery = await Grocery.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!grocery) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json(grocery);
  } catch (err) {
    handleError(res, err, 400);
  }
};

// Delete grocery item (soft delete by archiving)
exports.deleteGrocery = async (req, res) => {
  try {
    const grocery = await Grocery.findByIdAndUpdate(
      req.params.id,
      { archived: true },
      { new: true }
    );

    if (!grocery) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json({
      message: "Item archived successfully",
      archivedItem: grocery,
    });
  } catch (err) {
    handleError(res, err);
  }
};

// Mark all pending items as purchased and archive them
exports.purchaseAllPending = async (req, res) => {
  try {
    const result = await Grocery.updateMany(
      { completed: false, archived: false },
      {
        $set: {
          completed: true,
          archived: true,
          datePurchased: new Date(),
        },
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({ message: "No pending items to purchase" });
    }

    // Get the purchased items to return in response
    const purchasedItems = await Grocery.find({
      completed: true,
      archived: true,
      datePurchased: { $gte: new Date(Date.now() - 60000) }, // Items purchased in last minute
    }).sort({ datePurchased: -1 });

    res.json({
      message: `${result.modifiedCount} items marked as purchased and archived`,
      count: result.modifiedCount,
      purchasedItems,
    });
  } catch (err) {
    handleError(res, err);
  }
};
