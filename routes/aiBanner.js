const express = require("express");
const router = express.Router();

router.post("/generate", async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt || prompt.trim() === "") {
            return res.status(400).json({ error: "Prompt is required" });
        }

        const cleanPrompt = encodeURIComponent(prompt.trim());

        const imageUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=1024&height=1024&nologo=true`;

        return res.status(200).json({
            ok: true,
            imageUrl
        });

    } catch (err) {
        console.log("AI ERROR:", err.message);

        return res.status(500).json({
            ok: false,
            error: "Failed to generate image"
        });
    }
});

module.exports = router;