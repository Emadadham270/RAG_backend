/**
 * env.js
 * Centralises and validates required environment variables.
 * Import this before any other config so the app fails fast
 * if a critical variable is missing.
 */

const required = ["MONGO_URI", "JWT_SECRET"];

required.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

module.exports = {
  port: process.env.PORT || 5001,
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
};
