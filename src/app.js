/**
 * app.js
 * Creates and configures the Express application.
 *
 * Responsibilities:
 *  - Create the Express app
 *  - Register global middleware (JSON parsing, CORS, etc.)
 *  - Mount route handlers
 *  - Register the central error handler (must be last)
 *  - Export the app (used by server.js and tests)
 *
 * Do NOT start the HTTP server here.
 * Do NOT connect to the database here.
 */

const express = require("express");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const { errorHandler } = require("./middleware/errorMiddleware");

const app = express();

// ── Global middleware ──────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ── Health check ───────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({ success: true, message: "Server is running." });
});

// ── API routes ─────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);

// ── 404 handler ────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
});

// ── Central error handler (must be last) ───────────────────────────────────────
app.use(errorHandler);

module.exports = app;
