const express = require("express");
const { ApifyClient } = require("apify-client");
const dotenv = require("dotenv");

dotenv.config();

const router = express.Router();

// Initialize Apify Client with API token
const client = new ApifyClient({
    token: process.env.APIFY_API_TOKEN, // Ensure this is set in .env
});

// ✅ Twitter Scraper API Endpoint
router.post("/twitter-scraper", async (req, res) => {
    try {
        const { cookies, hashtag, startTime, endTime, sortBy, lang, maxItems } = req.body;

        if (!cookies || !hashtag || !startTime || !endTime || !sortBy || !lang || !maxItems) {
            return res.status(400).json({ error: "Missing required fields." });
        }

        const input = {
            cookies,  
            hashtag,
            startTime,
            endTime,
            sortBy,
            lang,
            maxItems: Number(maxItems),
            minRetweets: 0,
            minLikes: 0,
            minReplies: 0,
            onlyBuleVerifiedUsers: false,
            onlyVerifiedUsers: false,
            sentimentAnalysis: true
        };

        console.log("🚀 Twitter Scraper Input:", input);

        // Run the Apify Twitter Scraper Actor
        const run = await client.actor("bQ0LeyXn6BO51yFDY").call(input);

        const { items } = await client.dataset(run.defaultDatasetId).listItems();

        console.log("✅ Twitter Scraper Results:", items);
        res.json(items);

    } catch (error) {
        console.error("❌ Twitter API Error:", error.message);
        res.status(500).json({ error: "Failed to scrape Twitter data." });
    }
});

module.exports = router;
