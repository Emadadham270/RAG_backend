/**
 * errorMiddleware.js
 * Centralised Express error handler.
 *
 * Must be registered LAST in app.js (after all routes).
 * Controllers/services should throw errors or call next(error).
 *
 * Error shape:
 *   { success: false, message: string, stack?: string }
 */

const { nodeEnv } = require("../config/env");

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || res.statusCode === 200 ? err.statusCode || 500 : res.statusCode;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    // Include stack trace only in development to avoid leaking internals
    ...(nodeEnv === "development" && { stack: err.stack }),
  });
};

module.exports = { errorHandler };
