const express = require("express");
const router = express.Router();
const inventoryController = require("../../controllers/inventory/inventoryController");

// Get all inventory items
router.get("/", inventoryController.getInventory);

// Add new inventory item
router.post("/", inventoryController.addItem);

// Update inventory item by ID
router.put("/:id", inventoryController.updateItem);

// Delete inventory item by ID
router.delete("/:id", inventoryController.deleteItem);

module.exports = router;
