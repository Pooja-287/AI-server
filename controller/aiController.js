const AIContent = require("../model/aiContentModel");
const { extractYouTubeData, getYouTubeTranscript } = require("../utils/youtubeExtractor");
const { extractWebData } = require("../utils/webScrapper");
const translateText = require("../utils/translator");

/**
 * 📌 POST - Analyze URL (Supports YouTube + Web + Translation)
 */
const analyzeURL = async (req, res) => {
  try {
    const { url, mode = "brief", language = "english" } = req.body;

    if (!url) {
      return res.status(400).json({ success: false, message: "URL is required" });
    }

    let data;
    const isYouTube = url.includes("youtube.com") || url.includes("youtu.be");

    // ✅ STEP 1: Extract data
    if (isYouTube) {
      data = await extractYouTubeData(url);
      if (!data) return res.status(400).json({ success: false, message: "Invalid YouTube URL" });

      const transcript = data.transcript || "Transcript not available.";
      data.tamilVersion = await translateText(transcript, "ta");
      data.englishVersion = await translateText(transcript, "en");
    } else {
      data = await extractWebData(url);
      data.transcript = "Transcript not available for websites.";
      data.tamilVersion = await translateText(data.description, "ta");
      data.englishVersion = await translateText(data.description, "en");
    }

    // ✅ STEP 2: Generate meta tags and hashtags
    const { metaTags, hashtags } = generateMetaTags(data.title, data.description);

    // ✅ STEP 3: Save content to DB
    const newContent = new AIContent({
      user: req.user?._id || null,
      url,
      title: data.title || "Untitled Content",
      description: data.description || "No description found",
      script: data.transcript || "No script generated",
      metaTags,
      hashtags,
      thumbnailIdea: data.thumbnail || "",
      gemini_script: "Generated with Free Translate API",
      sourceType: isYouTube ? "youtube" : "website",
    });

    await newContent.save();

    res.status(201).json({
      success: true,
      message: "✅ Content generated successfully",
      data: newContent,
    });
  } catch (error) {
    console.error("❌ Error in analyzeURL:", error.message);
    res.status(500).json({ success: false, error: "Failed to analyze URL" });
  }
};

/**
 * 🧠 Generate smart meta tags and hashtags from title/description
 */
function generateMetaTags(title = "", description = "") {
  const words = (title + " " + description)
    .split(/\s+/)
    .filter(word => word.length > 3 && !/[^a-zA-Z]/.test(word))
    .slice(0, 8);

  const metaTags = words.map(w => w.toLowerCase());
  const hashtags = metaTags.map(w => `#${w}`).join(" ");

  return { metaTags, hashtags };
}
/**
 * 🧠 Generate smart meta tags and hashtags from title/description
 */
function generateMetaTags(title = "", description = "") {
  const words = (title + " " + description)
    .split(/\s+/)
    .filter(word => word.length > 3 && !/[^a-zA-Z]/.test(word))
    .slice(0, 8);

  const metaTags = words.map(w => w.toLowerCase());
  const hashtags = metaTags.map(w => `#${w}`).join(" ");

  return { metaTags, hashtags };
}


/**
 * 📌 GET - Fetch all contents of logged-in user
 */
const getUserContents = async (req, res) => {
  try {
    const contents = await AIContent.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: contents.length, data: contents });
  } catch (error) {
    console.error("❌ Error in getUserContents:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * 📌 PUT - Update content by ID
 */
const updateContent = async (req, res) => {
  try {
    const { id } = req.params;
    const content = await AIContent.findOne({ _id: id, user: req.user._id });
    if (!content) {
      return res.status(404).json({ success: false, message: "Content not found or unauthorized" });
    }

    Object.assign(content, req.body);
    await content.save();

    res.json({ success: true, message: "Content updated successfully", data: content });
  } catch (error) {
    console.error("❌ Error in updateContent:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * 📌 DELETE - Remove content by ID
 */
const deleteContent = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await AIContent.findOneAndDelete({ _id: id, user: req.user._id });
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Content not found or unauthorized" });
    }

    res.json({ success: true, message: "Content deleted successfully" });
  } catch (error) {
    console.error("❌ Error in deleteContent:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  analyzeURL,
  getUserContents,
  updateContent,
  deleteContent,
};
