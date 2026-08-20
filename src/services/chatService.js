/**
 * chatService.js
 * Business logic for a user's chat history.
 *
 * Supports the v4 conversational RAG API:
 *  - Passes session_id per user so the RAG model can rewrite follow-up questions
 *  - Stores chunk_id, rag_session_id, and full citation data
 */

const Message    = require("../models/Message");
const ragService = require("./ragService");

/**
 * Helper to translate text using LibreTranslate API.
 * Uses native https module to avoid fetch availability issues.
 */
const https = require("https");
const translateText = (text, source = "auto", target = "en") => {
  return new Promise((resolve) => {
    if (!text || text.trim() === "") {
      return resolve({ translatedText: text, detectedLanguage: source === "auto" ? "en" : source });
    }

    const payload = JSON.stringify({
      q: text,
      source,
      target,
      format: "text",
      alternatives: 3,
      api_key: ""
    });

    const options = {
      hostname: "libretranslate.com",
      path: "/translate",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, (res) => {
      let raw = "";
      res.on("data", (chunk) => { raw += chunk; });
      res.on("end", () => {
        if (res.statusCode >= 300) {
          console.warn(`Translation API warning: ${res.statusCode} - ${raw}`);
          return resolve({ translatedText: text, detectedLanguage: "en" });
        }
        try {
          const data = JSON.parse(raw);
          const detected = data.detectedLanguage 
            ? (Array.isArray(data.detectedLanguage) ? data.detectedLanguage[0]?.language : data.detectedLanguage.language)
            : "en";
            
          resolve({
            translatedText: data.translatedText || text,
            detectedLanguage: source === "auto" ? (detected || "en") : source
          });
        } catch (e) {
          console.error("Translation parse failed:", e.message);
          resolve({ translatedText: text, detectedLanguage: "en" });
        }
      });
    });

    req.on("error", (err) => {
      console.error("Translation request failed:", err.message);
      resolve({ translatedText: text, detectedLanguage: "en" });
    });

    req.write(payload);
    req.end();
  });
};

/**
 * Return all messages for a user, oldest first.
 */
const getHistory = async (userId) => {
  return Message.find({ userId }).sort({ createdAt: 1 });
};

/**
 * Ask a question via the RAG API, then persist the full Q&A exchange.
 * Uses the user's rag_session_id (stored on their latest message) so the
 * RAG model can maintain conversation context and rewrite follow-up questions.
 *
 * @param {string} userId
 * @param {string} question
 * @param {string} language
 * @returns {Promise<Message>}
 */
const askQuestion = async (userId, question, language = "auto") => {
  // Retrieve the last saved rag_session_id for this user so the RAG API
  // can maintain conversation context across turns.
  const lastMsg = await Message
    .findOne({ userId, rag_session_id: { $ne: null } })
    .sort({ createdAt: -1 });
  const sessionId = lastMsg?.rag_session_id || null;

  // 1. Translate the user's question to English before querying
  const { translatedText: englishQuestion, detectedLanguage } = await translateText(question, language, "en");

  let ragData;
  try {
    ragData = await ragService.query(englishQuestion, sessionId);
  } catch (err) {
    return Message.create({
      userId,
      question,
      answer:     "Sorry, I was unable to reach the knowledge base. Please try again.",
      evidence:   "",
      citations:  [],
      status:     "error",
      confidence: "low",
    });
  }

  // ── Map new v4 response schema ──────────────────────────────────
  const {
    answer,
    evidence,
    confidence,
    resources,
    citation,       // single primary citation object
    chunk_id,
    session_id: newSessionId,
  } = ragData;

  // Normalise confidence to allowed enum values
  const normalised = ["high", "medium", "low"].includes(
    (confidence || "").toLowerCase()
  )
    ? confidence.toLowerCase()
    : "medium";

  // Build citations array from the resources list
  const citations = Array.isArray(resources)
    ? resources.map((r) => ({
        document: r.document_id || "",
        source:   r.title       || "",
        section:  r.section     || "",
        page:     r.page        || 0,
        chunk_id: r.chunk_id    || "",
        title:    r.title       || "",
      }))
    : citation
      ? [{
          document: citation.document_id || "",
          source:   citation.title       || "",
          section:  citation.section     || "",
          page:     citation.page        || 0,
          chunk_id: citation.chunk_id    || "",
          title:    citation.title       || "",
        }]
      : [];

  // 2. Translate the answer back to the user's selected language if it wasn't English
  let finalAnswer = answer || "No answer returned.";
  const targetLanguage = language === "auto" ? detectedLanguage : language;
  
  if (targetLanguage && targetLanguage !== "en") {
    const { translatedText } = await translateText(finalAnswer, "en", targetLanguage);
    finalAnswer = translatedText || finalAnswer;
  }

  return Message.create({
    userId,
    question, // Save original question so the user sees what they typed
    answer:         finalAnswer,
    evidence:       evidence || "",
    citations,
    status:         "answered",
    confidence:     normalised,
    rag_session_id: newSessionId || sessionId || null,
    chunk_id:       chunk_id || (citation?.chunk_id) || "",
  });
};

/**
 * Delete a single message by ID.
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

module.exports = { getHistory, askQuestion, deleteMessage, clearHistory };
