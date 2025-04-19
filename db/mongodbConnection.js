const mongoose = require("mongoose");
let isDbConnected = false;

const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI ,
      {
        serverSelectionTimeoutMS: 15000, // Increased timeout but still reasonable
        heartbeatFrequencyMS: 30000,
        retryWrites: true,
        retryReads: true,
      }
    );
    console.log("MongoDB Connected sucessfully");
    isDbConnected = true;
  } catch (err) {
    console.error("MongoDB connection error:", err);
    console.log("Application continuining with limited functionality");
  }

  // Event handlers
  mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection error occurred:", err);
    isDbConnected = false;
  });

  mongoose.connection.on("disconnected", () => {
    console.log(
      "MongoDB disconnected, Mongoose will automatically try to reconnect"
    );
    isDbConnected = false;
  });

  mongoose.connection.on("reconnected", () => {
    console.log("MongoDB reconnected successfully");
    isDbConnected = true;
  });

  mongoose.connection.on("connected", () => {
    console.log("MongoDB connection established");
    isDbConnected = true;
  });

  return mongoose.connection;
};

module.exports = {
  connectDB,
  getDbStatus: () => isDbConnected,
  connection: mongoose.connection,
};
