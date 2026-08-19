/**
 * authMiddleware.js
 * Protects routes by verifying the JWT in the Authorization header.
 *
 * Usage:
 *   router.get("/profile", protect, userController.getProfile);
 */

const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/env");
const User = require("../models/User");

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Not authorised. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  const decoded = jwt.verify(token, jwtSecret); // throws on invalid/expired
  req.user = await User.findById(decoded.id).select("-password");

  if (!req.user) {
    return res.status(401).json({ success: false, message: "User belonging to this token no longer exists." });
  }

  next();
};

module.exports = { protect };
