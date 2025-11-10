// config/openrouterConfig.js
const OpenAI = require("openai");
require("dotenv").config();

// ✅ Create OpenAI client for OpenRouter
const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": process.env.SITE_URL || "",
    "X-Title": process.env.SITE_NAME || "AI Content Generator",
  },
});

module.exports = client; // ✅ Export as `client`
