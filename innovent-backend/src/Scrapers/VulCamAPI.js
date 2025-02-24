const express = require("express");
const { exec } = require("child_process");
const path = require("path");

const router = express.Router();

// ✅ Set the correct Python path from `where python`
const PYTHON_PATH = path.join(__dirname, "scripts", "venv", "Scripts", "python.exe"); // Adjust if needed

router.post("/scan-vulnerable-cameras", async (req, res) => {
    const { countryCode } = req.body;

    if (!countryCode) {
        return res.status(400).json({ error: "Country code is required." });
    }

    const scriptPath = path.join(__dirname, "scripts", "vulcam.py");

    console.log(`🔍 Running Python script: ${PYTHON_PATH} "${scriptPath}" ${countryCode}`);

    exec(`"${PYTHON_PATH}" "${scriptPath}" ${countryCode}`, (error, stdout, stderr) => {
        if (error) {
            console.error("❌ Python Execution Error:", error);
            return res.status(500).json({ error: "Failed to scan for vulnerable cameras." });
        }
        if (stderr) {
            console.error("⚠ Python STDERR:", stderr);
        }

        try {
            console.log("✅ Python Script Output:", stdout);
            const result = JSON.parse(stdout);
            res.json(result);
        } catch (err) {
            console.error("❌ JSON Parse Error:", err);
            res.status(500).json({ error: "Invalid response from scanner." });
        }
    });
});

module.exports = router;
