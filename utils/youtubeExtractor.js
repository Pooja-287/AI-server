const axios = require("axios");
const { YoutubeTranscript } = require("youtube-transcript");

async function extractYouTubeData(url) {
  try {
    const videoId = url.split("v=")[1]?.split("&")[0];
    const apiUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;

    // Basic info (title, author, thumbnail)
    const { data } = await axios.get(apiUrl);

    // Try fetching transcript
    let transcriptText = await getYouTubeTranscript(videoId);

    // Fetch page content to extract description
    let description = "Description not available";
    try {
      const page = await axios.get(`https://www.youtube.com/watch?v=${videoId}`);
      const match = page.data.match(/"shortDescription":"(.*?)","isCrawlable"/);
      if (match && match[1]) {
        description = match[1]
          .replace(/\\n/g, "\n")
          .replace(/\\"/g, '"')
          .trim();
      }
    } catch (err) {
      console.warn("⚠️ Failed to fetch YouTube description");
    }

    return {
      videoId,
      title: data.title,
      author: data.author_name,
      thumbnail: data.thumbnail_url,
      description,
      transcript: transcriptText,
    };
  } catch (err) {
    console.error("❌ Error extracting YouTube data:", err.message);
    return null;
  }
}

async function getYouTubeTranscript(videoId) {
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    return transcript.map(t => t.text).join(" ");
  } catch (err) {
    console.warn("⚠️ Transcript not available for this video");
    return "Transcript not available.";
  }
}

module.exports = { extractYouTubeData, getYouTubeTranscript };
