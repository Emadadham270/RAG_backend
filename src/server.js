/**
 * server.js
 * Application entry point.
 *
 * Responsibilities:
 *  - Load environment variables
 *  - Connect to the database
 *  - Start the HTTP server
 *  - Handle startup errors and graceful shutdown
 *
 * Do NOT put route definitions or middleware here.
 * Do NOT put business logic here.
 */

require("dotenv").config();

// env.js validates required variables and throws fast if any are missing
const { port } = require("./config/env");
const connectDB = require("./config/db");
const app = require("./app");

const startServer = async () => {
  await connectDB();

  const server = app.listen(port, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${port}`);
  });

  // Graceful shutdown
  const shutdown = (signal) => {
    console.log(`${signal} received. Shutting down gracefully...`);
    server.close(() => {
      console.log("HTTP server closed.");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
};

startServer().catch((err) => {
  console.error("Failed to start server:", err.message);
  process.exit(1);
});
