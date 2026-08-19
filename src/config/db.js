/**
 * db.js
 * Manages the MongoDB/Mongoose connection.
 * Called once from server.js during startup.
 */

const mongoose = require("mongoose");
const { mongoUri } = require("./env");

const connectDB = async () => {
  const conn = await mongoose.connect(mongoUri);
  console.log(`MongoDB connected: ${conn.connection.host}`);
};

module.exports = connectDB;
