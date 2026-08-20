/**
 * chatValidator.js
 * Validates incoming chat request data before it reaches the controller.
 */

/** POST /api/chat/ask — only needs a non-empty question */
const validateQuery = (req, res, next) => {
  const { question } = req.body;
  if (!question || question.trim().length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "Validation failed", errors: ["question is required."] });
  }
  next();
};

module.exports = { validateQuery };
