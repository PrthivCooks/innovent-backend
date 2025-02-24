const express = require("express");
const { ApifyClient } = require("apify-client");
const dotenv = require("dotenv");

dotenv.config();

const router = express.Router();

// Initialize Apify Client with API token
const client = new ApifyClient({
    token: process.env.APIFY_API_TOKEN, // Ensure this is set in .env
});

// **🔹 Instagram Hashtag Scraper Route**
router.post("/instagram-hashtag-scraper", async (req, res) => {
    try {
        const { hashtags, resultsLimit, resultsType } = req.body;

        if (!hashtags || !resultsType || !resultsLimit) {
            return res.status(400).json({ error: "Missing required fields", missingFields: ["hashtags", "resultsType", "resultsLimit"] });
        }

        const input = {
            hashtags,
            resultsLimit: Number(resultsLimit),
            resultsType,
        };

        console.log("🚀 Instagram Hashtag Scraper Input:", input);

        // Call the Apify Instagram Hashtag Scraper Actor
        const run = await client.actor("reGe1ST3OBgYZSsZJ").call(input);
        const { items } = await client.dataset(run.defaultDatasetId).listItems();

        console.log("✅ Hashtag Scraper Results:", items);
        res.json(items);

    } catch (error) {
        console.error("❌ Hashtag API Error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// **🔹 Instagram Profile Scraper Route**
router.post("/instagram-profile-scraper", async (req, res) => {
    try {
        const {
            search, searchType, searchLimit, resultsType,
            resultsLimit, addParentData, enhanceUserSearchWithFacebookPage,
            isUserReelFeedURL, isUserTaggedFeedURL
        } = req.body;

        // 🔍 Check for missing required fields
        const missingFields = [];
        if (!search) missingFields.push("search");
        if (!searchType) missingFields.push("searchType");
        if (!searchLimit) missingFields.push("searchLimit");
        if (!resultsType) missingFields.push("resultsType");
        if (!resultsLimit) missingFields.push("resultsLimit");

        if (missingFields.length > 0) {
            return res.status(400).json({ error: "Missing required fields", missingFields });
        }

        const input = {
            search,
            searchType,
            searchLimit: Number(searchLimit),
            resultsType,
            resultsLimit: Number(resultsLimit),
            addParentData: addParentData || false,
            enhanceUserSearchWithFacebookPage: enhanceUserSearchWithFacebookPage || false,
            isUserReelFeedURL: isUserReelFeedURL || false,
            isUserTaggedFeedURL: isUserTaggedFeedURL || false
        };

        console.log("🚀 Instagram Profile Scraper Input:", input);

        // Call the Apify Instagram Profile Scraper Actor
        const run = await client.actor("RB9HEZitC8hIUXAha").call(input);
        const { items } = await client.dataset(run.defaultDatasetId).listItems();

        console.log("✅ Profile Scraper Results:", items);

        // 🔍 Format response to match expected structure
        const formattedItems = items.map(item => ({
            searchTerm: search,
            searchSource: "facebook-ads",
            inputUrl: item.url,
            id: item.id || "MISSING",
            username: item.username || "MISSING",
            url: item.url || "MISSING",
            fullName: item.fullName || "MISSING",
            biography: item.biography || "MISSING",
            followersCount: item.followersCount || 0,
            followsCount: item.followsCount || 0,
            hasChannel: item.hasChannel || false,
            highlightReelCount: item.highlightReelCount || 0,
            isBusinessAccount: item.isBusinessAccount || false,
            joinedRecently: item.joinedRecently || false,
            businessCategoryName: item.businessCategoryName || "MISSING",
            private: item.private || false,
            verified: item.verified || false,
            profilePicUrl: item.profilePicUrl || "MISSING",
            profilePicUrlHD: item.profilePicUrlHD || "MISSING",
            facebookPage: item.facebookPage || {},
            igtvVideoCount: item.igtvVideoCount || 0,
            relatedProfiles: item.relatedProfiles || []
        }));

        res.json(formattedItems);

    } catch (error) {
        console.error("❌ Profile API Error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
