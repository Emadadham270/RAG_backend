/**
 * Message.js
 * Represents a single Q&A exchange stored in the chat history.
 *
 * Each record captures:
 *  - userId      : owner of the message
 *  - question    : the user's original question
 *  - answer      : the RAG recommendation (required)
 *  - evidence    : supporting evidence text from the RAG response
 *  - citations   : array of source references [{document, section, page}]
 *  - status      : "answered" | "error" | "pending"
 *  - confidence  : "high" | "medium" | "low" — from the RAG API
 */

const mongoose = require("mongoose");

const citationSchema = new mongoose.Schema(
  {
    document:   { type: String, default: "" },
    source:     { type: String, default: "" },
    section:    { type: String, default: "" },
    page:       { type: Number, default: 0  },
    chunk_id:   { type: String, default: "" },
    title:      { type: String, default: "" },
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    question: {
      type: String,
      required: [true, "Question is required"],
      trim: true,
    },
    answer: {
      type: String,
      required: [true, "Answer is required"],
      trim: true,
    },
    evidence: {
      type: String,
      default: "",
      trim: true,
    },
    citations: {
      type: [citationSchema],
      default: [],
    },
    status: {
      type: String,
      required: [true, "Status is required"],
      enum: ["pending", "answered", "error"],
      default: "answered",
    },
    confidence: {
      type: String,
      required: [true, "Confidence is required"],
      enum: ["high", "medium", "low"],
      default: "medium",
    },
    rag_session_id: {
      type: String,
      default: null,
    },
    chunk_id: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
