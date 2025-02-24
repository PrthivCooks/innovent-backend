const express = require("express");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/process-video", upload.single("video"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No video uploaded." });
    }

    try {
        // Send video to YOLO processing server
        const formData = new FormData();
        formData.append("video", req.file.buffer, { filename: "video.mp4" });

        const response = await axios.post("http://localhost:5001/process-video", formData, {
            headers: { ...formData.getHeaders() },
        });

        res.json(response.data);
    } catch (error) {
        console.error("❌ Error processing video:", error);
        res.status(500).json({ error: "Failed to process video." });
    }
});

module.exports = router;
