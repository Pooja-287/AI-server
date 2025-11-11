// config/openRouterConfig.js
const OpenAI = require("openai");
require("dotenv").config();

const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.SITE_URL || "",
    "X-Title": process.env.SITE_NAME || "AI Content Generator",
  },
});

// ✅ Only export the client instance
module.exports = openrouter;
