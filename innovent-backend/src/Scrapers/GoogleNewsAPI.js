const express = require("express");
const { getJson } = require("serpapi");

const router = express.Router();

// ✅ Google News API Endpoint
router.get("/google-news", async (req, res) => {
    try {
        const { query } = req.query; // Get keyword from query parameters

        if (!query) {
            return res.status(400).json({ error: "Missing required field: query" });
        }

        // Fetch Google News results
        getJson(
            {
                engine: "google_news",
                q: query, // User-input keyword
                gl: "us",
                hl: "en",
                api_key: "85c261d44fa7d3f382a97b305a953bb0f58b9ab395f57b396a887cdf415235e7",
            },
            (json) => {
                if (!json || !json.news_results) {
                    return res.status(500).json({ error: "No news results found" });
                }

                res.json(json.news_results); // Send the retrieved news data
            }
        );
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch Google News results" });
    }
});

module.exports = router; // ✅ Ensure ONLY the router is exported
