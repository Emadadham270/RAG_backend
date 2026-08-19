/**
 * chatService.js
 * Business logic for a user's chat history.
 *
 * All functions receive plain data — no req/res objects.
 * Errors are thrown with a statusCode so the central error handler
 * can respond with the correct HTTP status.
 */

const Message = require("../models/Message");

/**
 * Return all messages for a user, oldest first.
 */
const getHistory = async (userId) => {
  return Message.find({ userId }).sort({ createdAt: 1 });
};

/**
 * Add a new message to a user's chat history.
 * @param {string} userId
 * @param {{ content: string, status: string, evidenceQuality: string }} data
 */
const addMessage = async (userId, { content, status, evidenceQuality }) => {
  return Message.create({ userId, content, status, evidenceQuality });
};

/**
 * Delete a single message by ID.
 * Ensures the message belongs to the requesting user.
 */
const deleteMessage = async (userId, messageId) => {
  const message = await Message.findOneAndDelete({ _id: messageId, userId });
  if (!message) {
    const error = new Error("Message not found or does not belong to you.");
    error.statusCode = 404;
    throw error;
  }
  return message;
};

/**
 * Wipe the entire chat history for a user.
 */
const clearHistory = async (userId) => {
  const result = await Message.deleteMany({ userId });
  return { deletedCount: result.deletedCount };
};

module.exports = { getHistory, addMessage, deleteMessage, clearHistory };
