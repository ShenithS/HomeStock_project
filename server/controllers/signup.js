const userService = require("../services/signup");
const User = require("../models/user");

async function createUser(req, res) {
  try {
    const userData = req.body;
    const user = await userService.createUser(userData);

    res.status(201).json({
      user: user,
      message: "User created successfully",
    });
  } catch (error) { 
    console.error(error);
    res.status(400).json({ message: error.message });
  }
}


// Get all users
async function getAllUsers(req, res) {
  try {
    const users = await User.find(); // Retrieves all users
    res.status(200).json({ users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
}


async function getUserById(req, res) {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId); 

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching user", error: error.message });
  }
}

async function updateUser(req, res) {
  try {
    const userId = req.params.id;
    const updatedData = req.body;

    const user = await User.findByIdAndUpdate(userId, updatedData, { new: true });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      user,
      message: "User updated successfully"
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
}


async function deleteUser(req, res) {
  try {
    const userId = req.params.id;

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User deleted successfully"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting user", error: error.message });
  }
}

module.exports = { createUser, getAllUsers, getUserById, updateUser, deleteUser };
