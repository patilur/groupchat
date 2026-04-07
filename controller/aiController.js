const { GoogleGenAI } = require("@google/genai");
const dotenv = require("dotenv");
dotenv.config();

// Predictive Typing: Suggest the next few words
const getPredictiveText = async (req, res) => {
    const { text } = req.body;
    if (!text) return res.json({ suggestion: "" });

    try {
        const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        const responseFromAI = await genAI.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Complete this sentence naturally with 2-4 words.
                       Rules:
                       - Return ONLY the completion
                       - No explanation
                       - No punctuation at the start
                       Sentence: "${text}"`
        });

        // Using .text as per your working model
        res.status(200).json({ suggestion: responseFromAI.text });
    } catch (err) {
        console.error("AI Predict Error:", err);
        res.status(500).json({ error: "AI failed" });
    }
};

// Smart Replies: Provide 3 short responses
const getSmartReplies = async (req, res) => {
    const { lastMessage } = req.body;

    try {
        const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        const responseFromAI = await genAI.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Given the message: "${lastMessage}", provide exactly 3 short, 
                        distinct reply options separated by a pipe character (|). 
                        Example: Yes, I'll be there|Running late|Can we reschedule?
                        Rules:
                        - No explanations
                        - Return ONLY the options`
        });

        const replies = responseFromAI.text.split('|');
        res.status(200).json({ replies });
    } catch (err) {
        console.error("AI Replies Error:", err);
        res.status(500).json({ error: "AI failed" });
    }
};

module.exports = { getPredictiveText, getSmartReplies };