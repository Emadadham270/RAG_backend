/**
 * userService.js
 * Business logic for user-related operations.
 *
 * Add functions here as user features grow.
 * Keep this focused on user data operations.
 */

const User = require("../models/User");

/**
 * Return a user by ID (without password field).
 */
const getUserById = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }
  return user;
};

module.exports = { getUserById };
