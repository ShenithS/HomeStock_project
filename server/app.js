const express = require("express");
const mongoose = require("mongoose");
const connectDB = require("./configuration/dbConfig");
const signupRouter = require("./routes/signup");
const loginRouter = require("./routes/login");
const barcodeRoutes = require("./routes/iot/barcodeRoutes");

const budgetingRoutes = require("./routes/budgeting/budgetingRoutes");

const inventoryRoutes = require("./routes/inventory/inventoryRoutes");

const groceryRoutes = require("./routes/GroceryRoute/grocery");
const productRoutes = require("./routes/iot/productRoutes");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB connection
connectDB();

app.use(
  cors({
    origin: ["http://localhost:3000", "http://192.168.37.1:19000"], // Allow React and React Native apps
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(bodyParser.json());

// Routes
app.use("/api", signupRouter);
app.use("/auth", loginRouter);
app.use("/api", barcodeRoutes);
app.use("/api/products", productRoutes);
// Budgeting routes
app.use("/api", budgetingRoutes);

app.use("/api/inventory", inventoryRoutes);
app.use("/api/groceries", groceryRoutes);
app.listen(PORT, () => {
  console.log(`Server is running on: http://localhost:${PORT}`);
});
