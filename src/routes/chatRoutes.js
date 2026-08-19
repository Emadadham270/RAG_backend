/**
 * chatRoutes.js
 * /api/chat endpoints — all routes require a valid JWT.
 *
 * GET    /api/chat        → get full chat history
 * POST   /api/chat        → add a message
 * DELETE /api/chat/:id    → delete one message
 * DELETE /api/chat        → clear entire history
 */

const express = require("express");
const chatController = require("../controllers/chatController");
const { protect } = require("../middleware/authMiddleware");
const { validateMessage } = require("../validators/chatValidator");

const router = express.Router();

// All chat routes are protected
router.use(protect);

router.get("/", chatController.getHistory);
router.post("/", validateMessage, chatController.addMessage);
router.delete("/", chatController.clearHistory);   // clear all — must come before /:id
router.delete("/:id", chatController.deleteMessage);

module.exports = router;
