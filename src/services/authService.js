/**
 * authService.js
 * Business logic for authentication.
 *
 * Responsibilities:
 *  - User registration
 *  - User login
 *  - Token generation
 *
 * This layer is kept separate from HTTP concerns (req/res).
 * authController.js calls these functions and handles responses.
 */

const User = require("../models/User");
const generateToken = require("../utils/generateToken");

/**
 * Register a new user.
 * Throws an error if the email is already taken.
 */
const register = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error("Email is already registered.");
    error.statusCode = 409;
    throw error;
  }

  const user = await User.create({ name, email, password });
  const token = generateToken(user._id);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

/**
 * Login an existing user.
 * Throws an error for invalid credentials.
 */
const login = async ({ email, password }) => {
  // Explicitly select password since the field has select: false
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user._id);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

module.exports = { register, login };
