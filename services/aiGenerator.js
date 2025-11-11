// services/aiGenerator.js
const { openrouter } = require("../config/openRouterConfig");
const axios = require("axios");

/**
 * 🎯 Main AI Content Generator
 * Handles multi-language + YouTube transcript + free fallback
 */
async function generateContent(data, mode = "brief", language = "english") {
  const prompt = `
    You are an AI assistant that generates creative content in ${language}.
    Analyze the following data and produce a ${mode} level response.
    Return JSON with fields:
    { description, script, metaTags, hashtags, thumbnailIdea, gemini_script }

    Data:
    ${JSON.stringify(data, null, 2)}
  `;

  const primaryModel = "gpt-4o-mini";
  const fallbackModel = "mistralai/mistral-7b-instruct";

  try {
    return await requestAI(primaryModel, prompt);
  } catch (primaryError) {
    console.warn(`⚠️ Primary model failed (${primaryError.message}), switching to fallback model...`);
    try {
      return await requestAI(fallbackModel, prompt);
    } catch (fallbackError) {
      console.error("❌ Both models failed, using offline generator...");
      return offlineGenerator(data, mode, language);
    }
  }
}

/**
 * 🔧 Calls OpenRouter API
 */
async function requestAI(model, prompt) {
  const response = await openrouter.chat.completions.create({
    model,
    messages: [
      { role: "system", content: "You are a helpful AI content generator." },
      { role: "user", content: prompt },
    ],
    max_tokens: 1000,
    temperature: 0.7,
  });

  const message = response.choices[0].message.content;
  try {
    return JSON.parse(message);
  } catch {
    return { description: message };
  }
}

/**
 * 🧩 Offline Generator (used if OpenRouter fails)
 */
function offlineGenerator(data, mode, language) {
  const title = data.title || "Untitled Content";
  const transcript = data.transcript || "Transcript not available.";

  return {
    description: `${title} - Offline ${mode} summary generated in ${language}.`,
    script: `Let's explore "${title}". Here's a simple overview based on the available transcript.`,
    metaTags: ["AI", "Offline", "Summary"],
    hashtags: "#AI #OfflineMode #Summary",
    thumbnailIdea: "A thumbnail with ${title} and visual context.",
    gemini_script: `This summary was created offline in ${language}. Transcript snippet: ${transcript.slice(0, 100)}...`,
  };
}

module.exports = generateContent;
