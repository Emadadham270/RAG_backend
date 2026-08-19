/**
 * authValidator.js
 * Express middleware validators for auth routes.
 * Uses plain JS — swap for express-validator or Joi if the project grows.
 */

const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push("Name must be at least 2 characters.");
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("A valid email is required.");
  }
  if (!password || password.length < 8) {
    errors.push("Password must be at least 8 characters.");
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: "Validation failed", errors });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email) errors.push("Email is required.");
  if (!password) errors.push("Password is required.");

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: "Validation failed", errors });
  }

  next();
};

module.exports = { validateRegister, validateLogin };
