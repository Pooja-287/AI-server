const axios = require("axios");

async function extractYouTubeData(url) {
  // Example logic (you can later improve this with YouTube API)
  const videoId = url.split("v=")[1]?.split("&")[0];
  const apiUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;

  const { data } = await axios.get(apiUrl);
  return {
    title: data.title,
    description: data.author_name,
    thumbnail: data.thumbnail_url,
  };
}

module.exports = extractYouTubeData;
