const translate = require("@vitalets/google-translate-api");
const franc = require("franc");

/**
 * 🌐 Detect and optionally translate text
 * @param {string} text - The text to process
 * @param {string} targetLang - Target language (default: English)
 * @returns {Object} { detectedLang, translatedText }
 */
async function detectAndTranslate(text, targetLang = "en") {
  try {
    if (!text || text.trim().length === 0)
      return { detectedLang: "unknown", translatedText: text };

    // Detect language
    const detectedLangCode = franc(text);
    const detectedLang = detectedLangCode === "und" ? "unknown" : detectedLangCode;

    // If already English, skip translation
    if (detectedLang === "eng" || detectedLang === "en") {
      return { detectedLang: "english", translatedText: text };
    }

    // Translate to target language
    const result = await translate(text, { to: targetLang });
    return {
      detectedLang,
      translatedText: result.text,
    };
  } catch (error) {
    console.error("❌ Language detection/translation failed:", error.message);
    return { detectedLang: "unknown", translatedText: text };
  }
}

module.exports = detectAndTranslate;
