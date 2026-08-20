/**
 * ragService.js
 * Thin wrapper around the external RAG API (v4 — conversational).
 *
 * POST /ask
 * Body:    { "question": string, "k": number, "session_id": string? }
 * Returns: { session_id, turn_index, answer, confidence, chunk_id,
 *            evidence, citation, resources, metadata, rewritten_question }
 */

const https = require("https");
const http  = require("http");
const { URL } = require("url");

let RAG_API_URL = process.env.RAG_API_URL || "https://octagon-thespian-take.ngrok-free.dev/ask";
// Ensure the path always ends with /ask
if (!RAG_API_URL.endsWith("/ask")) {
  RAG_API_URL = RAG_API_URL.replace(/\/+$/, "") + "/ask";
}

/**
 * Send a question to the external RAG API.
 * @param {string} question
 * @param {string|null} sessionId  – pass to continue a conversation
 * @returns {Promise<Object>}  Full API response object
 */
const query = (question, sessionId = null) => {
  return new Promise((resolve, reject) => {
    const payload = { question, k: 5 };
    if (sessionId) payload.session_id = sessionId;

    const body    = JSON.stringify(payload);
    const parsed  = new URL(RAG_API_URL);
    const transport = parsed.protocol === "https:" ? https : http;

    const options = {
      hostname: parsed.hostname,
      path:     parsed.pathname + parsed.search,
      method:   "POST",
      headers: {
        "Content-Type":               "application/json",
        "Content-Length":             Buffer.byteLength(body),
        "ngrok-skip-browser-warning": "true",
        "User-Agent":                 "PostmanRuntime/7.32.2",
        "Accept":                     "application/json",
      },
    };

    const req = transport.request(options, (res) => {
      let raw = "";
      res.on("data", (chunk) => { raw += chunk; });
      res.on("end", () => {
        try {
          const data = JSON.parse(raw);
          if (res.statusCode < 200 || res.statusCode >= 300) {
            const err = new Error(`RAG API error ${res.statusCode}: ${data.detail || raw}`);
            err.statusCode = 502;
            return reject(err);
          }
          resolve(data);
        } catch {
          const err = new Error(`Failed to parse RAG API response: ${raw.slice(0, 200)}`);
          err.statusCode = 502;
          reject(err);
        }
      });
    });

    req.on("error", (e) => {
      const err = new Error(`RAG API unreachable: ${e.message}`);
      err.statusCode = 502;
      reject(err);
    });

    req.write(body);
    req.end();
  });
};

module.exports = { query };
