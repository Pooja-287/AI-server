const openrouter = require("../config/openRouterConfig");

async function generateContent(data, mode = "brief", language = "english") {
  try {
    const prompt = `
You are an expert YouTube content script generator.

Analyze the following YouTube data in ${language} and generate ${mode} content.

Return pure JSON (no code block markdown). Example:
{
  "title": "...",
  "topic": "...",
  "script": "...",
  "description": "...",
  "summary": "...",
  "metaTags": [],
  "hashtags": "",
  "thumbnailIdea": "",
  "gemini_script": ""
}

Data:
${JSON.stringify(data, null, 2)}
    `;

    const response = await openrouter.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful AI YouTube script generator." },
        { role: "user", content: prompt },
      ],
      max_tokens: 1200,
      temperature: 0.7,
    });

    let message = response.choices[0].message.content.trim();

    // 🧹 Remove code block formatting (```json ... ```)
    message = message.replace(/```json|```/g, "").trim();

    let aiData;
    try {
      aiData = JSON.parse(message);
    } catch (e) {
      console.warn("⚠️ Could not parse JSON, returning raw text instead.");
      aiData = { description: message };
    }

    return aiData;
  } catch (error) {
    console.error("❌ Error generating content:", error.response?.data || error.message);
    throw new Error("Failed to generate timestamp-based content");
  }
}
module.exports =  generateContent ; 