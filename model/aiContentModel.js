const mongoose = require("mongoose");

const aiContentSchema = new mongoose.Schema(
  {
    // 👤 Reference to the logged-in user
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },

    // 🌐 Basic content details
    url: { 
      type: String, 
      required: true 
    },
    title: { 
      type: String, 
      default: "Untitled Content" 
    },
    description: { 
      type: String, 
      default: "" 
    },

    // 🧠 AI-generated data
    script: { 
      type: mongoose.Schema.Types.Mixed, 
      default: "" 
    },
    metaTags: { 
      type: [String], 
      default: [] 
    },
    hashtags: { 
      type: String, 
      default: "" 
    },
    thumbnailIdea: { 
      type: String, 
      default: "" 
    },
    gemini_script: { 
      type: String, 
      default: "" 
    },

    // 📹 or 🌍 Source type: YouTube or website
    sourceType: { 
      type: String, 
      enum: ["youtube", "website"], 
      default: "website" 
    },
  },
  { 
    timestamps: true // ⏰ Automatically adds createdAt and updatedAt
  }
);

const AIContent = mongoose.model("AIContent", aiContentSchema);

module.exports = AIContent;
