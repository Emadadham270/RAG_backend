/**
 * chatValidator.js
 * Validates incoming message data before it reaches the controller.
 */

const validateMessage = (req, res, next) => {
  const { content, status, evidenceQuality } = req.body;
  const errors = [];

  if (!content || content.trim().length === 0) {
    errors.push("content is required.");
  }
  if (!status || status.trim().length === 0) {
    errors.push("status is required.");
  }
  if (!evidenceQuality || evidenceQuality.trim().length === 0) {
    errors.push("evidenceQuality is required.");
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: "Validation failed", errors });
  }

  next();
};

module.exports = { validateMessage };
