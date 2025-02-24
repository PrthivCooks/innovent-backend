const { ApifyClient } = require('apify-client');
const express = require("express");
const dotenv = require("dotenv");

dotenv.config();

const router = express.Router();

// Initialize Apify Client with API token
const client = new ApifyClient({
    token: process.env.APIFY_API_TOKEN, // ✅ Use environment variable for security
});

// **🔹 Facebook Video Scraper Route**
router.post("/facebook-video-scraper", async (req, res) => {
    try {
        const { keywordList, resultsLimit } = req.body;

        if (!keywordList || !resultsLimit) {
            return res.status(400).json({ error: "Missing required fields", missingFields: ["keywordList", "resultsLimit"] });
        }

        const input = {
            keywordList,
            resultsLimit: Number(resultsLimit),
        };

        console.log("🚀 Facebook Video Scraper Input:", input);

        // Run the Apify Facebook Scraper Actor
        const run = await client.actor("qgl7gVMdjLUUrMI5P").call(input);
        const { items } = await client.dataset(run.defaultDatasetId).listItems();

        console.log("✅ Facebook Scraper Results:", items);
        res.json(items);
    } catch (error) {
        console.error("❌ Facebook API Route Error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
