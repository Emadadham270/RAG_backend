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

const express    = require("express");
const cors       = require("cors");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const { errorHandler } = require("./middleware/errorMiddleware");

const app = express();

// ── CORS ───────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: [
      "http://localhost:5173",  // Vite dev server
      "http://localhost:5174",  
      "http://localhost:5175",  
      "http://localhost:4173",  // Vite preview
    ],
    credentials: true,
  })
);

// ── Global middleware ──────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ── Health check ───────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({ success: true, message: "Server is running." });
});

// ── API routes ─────────────────────────────────────────────────────────────────
app.use("/api/auth",  authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat",  chatRoutes);

// ── 404 handler ────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
});

// ── Central error handler (must be last) ───────────────────────────────────────
app.use(errorHandler);

module.exports = app;
