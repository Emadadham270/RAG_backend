/**
 * authRoutes.js
 * Defines /api/auth endpoints.
 *
 * Routes are thin: middleware + controller only.
 * No business logic here.
 */

const express = require("express");
const authController = require("../controllers/authController");
const { validateRegister, validateLogin } = require("../validators/authValidator");

const router = express.Router();

router.post("/register", validateRegister, authController.register);
router.post("/login", validateLogin, authController.login);

module.exports = router;
