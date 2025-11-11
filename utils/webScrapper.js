const axios = require("axios");
const cheerio = require("cheerio");
const detectAndTranslate = require("./languageHelper");

async function extractWebData(url) {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const title =
      $("meta[property='og:title']").attr("content") ||
      $("title").text().trim() ||
      "Untitled";

    const description =
      $("meta[property='og:description']").attr("content") ||
      $("meta[name='description']").attr("content") ||
      "No description available.";

    const image =
      $("meta[property='og:image']").attr("content") ||
      $("meta[name='twitter:image']").attr("content") ||
      null;

    const lang = $("html").attr("lang") || "unknown";

    // 🌍 Detect + translate
    const { detectedLang, translatedText } = await detectAndTranslate(description, "en");

    return {
      title,
      description,
      image,
      htmlLang: lang,
      detectedLang,
      translatedDescription: translatedText,
      sourceType: "website",
    };
  } catch (error) {
    console.error("❌ Web scraping failed:", error.message);
    throw new Error("Failed to extract website data");
  }
}

module.exports = { extractWebData };
