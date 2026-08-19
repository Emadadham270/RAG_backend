/**
 * chatController.js
 * HTTP layer for chat history endpoints.
 *
 * All routes are protected — req.user is populated by authMiddleware.
 * Business logic lives in chatService.js.
 */

const chatService = require("../services/chatService");
const { success } = require("../utils/formatResponse");

/** GET /api/chat — retrieve the authenticated user's full chat history */
const getHistory = async (req, res, next) => {
  try {
    const messages = await chatService.getHistory(req.user.id);
    res.status(200).json(success(messages, "Chat history retrieved."));
  } catch (err) {
    next(err);
  }
};

/** POST /api/chat — add a new message to the authenticated user's history */
const addMessage = async (req, res, next) => {
  try {
    const message = await chatService.addMessage(req.user.id, req.body);
    res.status(201).json(success(message, "Message added."));
  } catch (err) {
    next(err);
  }
};

/** DELETE /api/chat/:id — delete a specific message (must belong to the user) */
const deleteMessage = async (req, res, next) => {
  try {
    const deleted = await chatService.deleteMessage(req.user.id, req.params.id);
    res.status(200).json(success(deleted, "Message deleted."));
  } catch (err) {
    next(err);
  }
};

/** DELETE /api/chat — wipe the entire chat history for the authenticated user */
const clearHistory = async (req, res, next) => {
  try {
    const result = await chatService.clearHistory(req.user.id);
    res.status(200).json(success(result, "Chat history cleared."));
  } catch (err) {
    next(err);
  }
};

module.exports = { getHistory, addMessage, deleteMessage, clearHistory };
