const express = require("express");
const router = express.Router();
const {
  analyzeURL,
  getUserContents,
  updateContent,
  deleteContent,
} = require("../controller/aiController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/generate", authMiddleware, analyzeURL);
router.get("/contents", authMiddleware, getUserContents);
router.put("/content/:id", authMiddleware, updateContent);
router.delete("/content/:id", authMiddleware, deleteContent);

module.exports = router;
