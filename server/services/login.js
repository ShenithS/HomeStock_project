const bcrypt = require("bcrypt");
const User = require("../models/user");
const { generateToken } = require("../util/jwtUtils");

async function login(email, password) {
  try {
    
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      throw new Error("User not found");
    }

 
    const isPasswordValid = await bcrypt.compare(password, existingUser.password); 
    if (!isPasswordValid) {
      throw new Error("Incorrect password");
    }

    const token = generateToken(existingUser);
    return token;  

  } catch (error) {
    console.log("login error :",error.message)
    throw new Error("Invalid credentials");
  }
}

module.exports = {
  login,
};
