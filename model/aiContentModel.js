const mongoose = require("mongoose");

const aiContentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    url: { type: String, required: true },
    title: { type: String, default: "Untitled Content" },
    description: { type: String, default: "" },
    script: { type: String, default: "" },
    metaTags: { type: [String], default: [] },
    hashtags: { type: String, default: "" },
    thumbnailIdea: { type: String, default: "" },
    gemini_script: { type: String, default: "" },
    sourceType: { type: String, enum: ["youtube", "website"], default: "website" },

    // ✅ Added this:
    timestamps: {
      type: Map,
      of: String, // Example: { inputValidation: "01:15", dataExtraction: "02:30" }
      default: {},
    },

    // optional
    topic: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AIContent", aiContentSchema);
