/**
 * authController.js
 * Handles HTTP requests for authentication endpoints.
 *
 * Responsibilities:
 *  - Read request data
 *  - Call the appropriate authService function
 *  - Return the HTTP response
 *
 * Business logic lives in authService.js, NOT here.
 */

const authService = require("../services/authService");
const { success } = require("../utils/formatResponse");

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(success(result, "Registration successful."));
  } catch (err) {
    next(err); // forwarded to central error handler
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.status(200).json(success(result, "Login successful."));
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login };
