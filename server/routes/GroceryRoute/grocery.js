const express = require("express");
const router = express.Router();
const groceryController = require("../../controllers/GroceryController/groceryController");

router.get("/", groceryController.getAllGroceries);
router.get("/archived", groceryController.getArchivedGroceries);
router.post("/", groceryController.addGrocery);
router.put("/:id", groceryController.updateGrocery);
router.delete("/:id", groceryController.deleteGrocery);
router.post("/purchase-all", groceryController.purchaseAllPending);

module.exports = router;
