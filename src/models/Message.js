/**
 * Message.js
 * A single message inside a user's chat history.
 *
 * Each message belongs to one user (userId) and contains three string fields:
 *  - content        : the message text
 *  - status         : e.g. "pending", "answered", "error" — free-form string
 *  - evidenceQuality: e.g. "high", "medium", "low"   — free-form string
 *
 * All three fields are required. Messages are soft-ordered by createdAt.
 */

const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // fast lookup of a user's history
    },
    content: {
      type: String,
      required: [true, "Message content is required"],
      trim: true,
    },
    status: {
      type: String,
      required: [true, "Message status is required"],
      trim: true,
    },
    evidenceQuality: {
      type: String,
      required: [true, "Evidence quality is required"],
      trim: true,
    },
  },
  { timestamps: true } // createdAt, updatedAt
);

module.exports = mongoose.model("Message", messageSchema);
