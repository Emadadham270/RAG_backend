/**
 * chatRoutes.js
 * /api/chat endpoints — all routes require a valid JWT.
 *
 * GET    /api/chat        → get full chat history
 * POST   /api/chat/ask    → ask a question (calls RAG API + saves to DB)
 * DELETE /api/chat/:id    → delete one message
 * DELETE /api/chat        → clear entire history
 */

const express        = require("express");
const chatController = require("../controllers/chatController");
const { protect }    = require("../middleware/authMiddleware");
const { validateQuery } = require("../validators/chatValidator");

const router = express.Router();

// All chat routes are protected
router.use(protect);

router.get("/",         chatController.getHistory);
router.post("/ask",     validateQuery, chatController.askQuestion);
router.delete("/",      chatController.clearHistory); // clear all — before /:id
router.delete("/:id",   chatController.deleteMessage);

module.exports = router;
