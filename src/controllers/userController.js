/**
 * userController.js
 * Handles HTTP requests for user endpoints.
 */

const userService = require("../services/userService");
const { success } = require("../utils/formatResponse");

/**
 * GET /api/users/me
 * Returns the currently authenticated user's profile.
 */
const getMe = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.user.id);
    res.status(200).json(success(user));
  } catch (err) {
    next(err);
  }
};

module.exports = { getMe };
