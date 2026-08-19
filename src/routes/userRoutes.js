/**
 * userRoutes.js
 * Defines /api/users endpoints.
 */

const express = require("express");
const userController = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// All routes below require a valid JWT
router.get("/me", protect, userController.getMe);

module.exports = router;
