import express from "express";
import fetch from "node-fetch";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const r = await fetch(
      "https://mental-healthcare-chatbot-application.streamlit.app/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body),
      }
    );

    const contentType = r.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const json = await r.json();
      return res.status(200).json(json);
    } else {
      const text = await r.text();
      return res.status(200).json({ reply: text });
    }
  } catch (err) {
    console.error("Chatbot Proxy Error:", err);
    return res.status(500).json({
      success: false,
      reply: "Server error. Please try again later.",
    });
  }
});

export default router;