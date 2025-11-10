const axios = require("axios");
const cheerio = require("cheerio");

async function extractWebData(url) {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  const title = $("meta[property='og:title']").attr("content") || $("title").text() || "Untitled";
  const description =
    $("meta[property='og:description']").attr("content") ||
    $("meta[name='description']").attr("content") ||
    "No description available.";

  return { title, description };
}

module.exports = { extractWebData };
