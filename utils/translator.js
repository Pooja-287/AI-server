const axios = require("axios");

async function translateText(text, targetLang) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(
    text
  )}`;
  try {
    const { data } = await axios.get(url);
    return data[0].map((item) => item[0]).join("");
  } catch (error) {
    console.error("Translation error:", error.message);
    return text;
  }
}

module.exports = translateText;
