const axios = require("axios");
const AIContent = require("../model/aiContentModel");
const extractYouTubeData = require("../utils/youtubeExtractor");
const { extractWebData } = require("../utils/webScrapper");
const openrouter = require("../config/openRouterConfig");
const generateContent = require("../services/aiGenerator");

/**
 * 📌 POST - Analyze URL (Authenticated)
 * Supports dynamic timestamps from user or auto-generated logs
 * Includes optional "noCopyright" mode for 100% original AI content
 */
const analyzeURL = async (req, res) => {
  try {
    const {
      url,
      mode = "brief",
      language = "english",
      timestamps = {}, // optional dynamic timestamps
      noCopyright = false, // ✅ new flag
    } = req.body;

    if (!url)
      return res.status(400).json({ success: false, message: "URL is required" });

    // Timer tracking object
    const timeTracker = {};

    const markStart = (label) => (timeTracker[label] = Date.now());
    const markEnd = (label) => {
      const elapsed = Date.now() - timeTracker[label];
      return `${elapsed}ms`;
    };

    // 🔹 01: Input Validation
    markStart("Input Validation");
    if (!url) {
      return res.status(400).json({ success: false, message: "Missing URL" });
    }
    const validationTime = markEnd("Input Validation");

    // 🔹 02: URL Type Check
    markStart("URL Type Check");
    const isYouTube = url.includes("youtube.com") || url.includes("youtu.be");
    const typeCheckTime = markEnd("URL Type Check");

    // 🔹 03: Data Extraction
    markStart("Data Extraction");
    const data = isYouTube
      ? await extractYouTubeData(url)
      : await extractWebData(url);
    const extractionTime = markEnd("Data Extraction");

    // 🔹 04: AI Content Generation (with No-Copyright Mode)
    markStart("AI Content Generation");

    // Add copyright-free instruction
    const extraPrompt = noCopyright
      ? "Generate a completely original, copyright-free YouTube script. Avoid copying or paraphrasing any existing scripts, lyrics, or text. Create unique, creative, and safe-to-upload content suitable for monetization."
      : "";

    const aiResponse = await generateContent(
      {
        ...data,
        prompt: `${data.title || ""}\n\n${extraPrompt}`,
      },
      mode,
      language
    );
    const generationTime = markEnd("AI Content Generation");

    // 🔹 05: Save to Database
    markStart("Save to Database");
    const newContent = new AIContent({
      user: req.user._id,
      url,
      title: data.title || "Untitled Content",
      description: aiResponse.description || "",
      script: aiResponse.script || "",
      metaTags: aiResponse.metaTags || [],
      hashtags: aiResponse.hashtags || "",
      thumbnailIdea: aiResponse.thumbnailIdea || "",
      gemini_script: aiResponse.gemini_script || "",
      sourceType: isYouTube ? "youtube" : "website",
      timestamps: {
        inputValidation: timestamps.inputValidation || validationTime,
        urlTypeCheck: timestamps.urlTypeCheck || typeCheckTime,
        dataExtraction: timestamps.dataExtraction || extractionTime,
        aiGeneration: timestamps.aiGeneration || generationTime,
        dbSave: timestamps.dbSave || markEnd("Save to Database"),
      },
      noCopyright, // ✅ store flag for reference
    });

    await newContent.save();

    // ✅ Success response
    res.status(201).json({
      success: true,
      message: "✅ Content generated successfully",
      data: {
        ...newContent.toObject(),
        copyright:
          noCopyright === true
            ? "✅ This content is 100% original and AI-generated. It is safe for YouTube monetization and free of copyright claims."
            : "⚠️ Generated from provided source. Verify before using for monetized content.",
      },
    });
  } catch (error) {
    console.error("❌ Error in analyzeURL:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * 📌 GET - Fetch all contents of logged-in user
 */
const getUserContents = async (req, res) => {
  try {
    const contents = await AIContent.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
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
    if (!content)
      return res
        .status(404)
        .json({ success: false, message: "Content not found or unauthorized" });

    Object.assign(content, req.body);
    await content.save();
    res.json({ success: true, message: "✅ Content updated", data: content });
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
    const deleted = await AIContent.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });
    if (!deleted)
      return res
        .status(404)
        .json({ success: false, message: "Content not found or unauthorized" });

    res.json({ success: true, message: "🗑️ Content deleted successfully" });
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
