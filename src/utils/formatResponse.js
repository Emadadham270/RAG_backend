/**
 * formatResponse.js
 * Provides a consistent shape for all API responses.
 *
 * Usage:
 *   res.json(success(data, "User created"));
 *   res.status(400).json(failure("Validation failed", errors));
 */

const success = (data = null, message = "OK") => ({
  success: true,
  message,
  data,
});

const failure = (message = "An error occurred", errors = null) => ({
  success: false,
  message,
  ...(errors && { errors }),
});

module.exports = { success, failure };
