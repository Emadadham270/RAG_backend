/**
 * generateToken.js
 * Issues a signed JWT for a given user ID.
 *
 * Used by: authService.js
 */

const jwt = require("jsonwebtoken");
const { jwtSecret, jwtExpiresIn } = require("../config/env");

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, jwtSecret, { expiresIn: jwtExpiresIn });
};

module.exports = generateToken;
