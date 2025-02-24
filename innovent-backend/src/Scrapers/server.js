const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const instagramRoutes = require("./InstagramAPI.js");
const googleNewsRoutes = require("./GoogleNewsAPI.js");
const twitterRoutes = require("./TwitterAPI.js");
const facebookRoutes = require("./FacebookAPI.js");
const imageMetadataRoutes = require("./ImageMetAPI.js");
const vulCamRoutes = require("./VulCamAPI.js");
const cctvMonRoutes = require("./CCTVmonAPI1.js"); // ✅ Ensure the path is correct

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Register API Routes
app.use("/api", instagramRoutes);
app.use("/api", googleNewsRoutes);
app.use("/api", twitterRoutes);
app.use("/api", facebookRoutes);
app.use("/api", imageMetadataRoutes);
app.use("/api", vulCamRoutes);
app.use("/api", cctvMonRoutes); // ✅ Make sure the file exists in the correct directory

// ✅ Root endpoint
app.get("/", (req, res) => {
    res.send("✅ API Server is Running!");
});

// ✅ Handle Undefined Routes
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

// ✅ Global Error Handler
app.use((err, req, res, next) => {
    console.error("❌ Server Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
});

// ✅ Start the server
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
