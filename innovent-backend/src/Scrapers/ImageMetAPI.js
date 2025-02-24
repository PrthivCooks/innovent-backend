const express = require("express");
const multer = require("multer");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// ✅ Configure Multer to Store Images in Memory Instead of Disk
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ Route: Upload and Extract Metadata Without Saving Files
router.post("/imagemet", upload.single("image"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    // Create a temporary file to pass to ExifTool
    const tempFilePath = path.join(__dirname, `${Date.now()}_${req.file.originalname}`);
    
    fs.writeFile(tempFilePath, req.file.buffer, (err) => {
        if (err) {
            return res.status(500).json({ error: "Failed to process image" });
        }

        // Run ExifTool on the temporary file
        exec(`exiftool "${tempFilePath}"`, (error, stdout, stderr) => {
            // Delete the temporary file after processing
            fs.unlink(tempFilePath, () => {});

            if (error || stderr) {
                return res.status(500).json({ error: "Failed to extract metadata" });
            }

            // Convert metadata into JSON
            const metadata = stdout.split("\n").reduce((acc, line) => {
                const [key, value] = line.split(": ");
                if (key && value) acc[key.trim()] = value.trim();
                return acc;
            }, {});

            res.json({ metadata });
        });
    });
});

module.exports = router;
