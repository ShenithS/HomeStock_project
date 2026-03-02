const mongoose = require("mongoose");

const dbURI = "mongodb+srv://admin:kJ7Y3X6Kb9UPEEsp@cluster0.urovpus.mongodb.net/";

const connectDB = async () => {
    try {
        await mongoose.connect(dbURI);
        console.log("MongoDB connected successfully.");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
};

module.exports = connectDB;
