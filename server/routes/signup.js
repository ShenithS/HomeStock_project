const express = require("express");
const signupController = require("../controllers/signup");

const router = express.Router();

router.post("/register", signupController.createUser);
router.get("/user", signupController.getAllUsers);
router.get("/user/:id", signupController.getUserById);
router.put("/user/:id", signupController.updateUser);
router.delete("/user/:id", signupController.deleteUser);

module.exports = router;
