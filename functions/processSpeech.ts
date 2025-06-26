import axios from "axios";
import { Request, Response } from "express";

// YouTube API setup
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3/search";

// GROQ API setup
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// Sample training topics you expect (or extract from YouTube metadata)
const candidateLabels = [
  "how to use fertilizer",
  "irrigation methods",
  "pest control",
  "crop rotation",
  "climate change in agriculture",
  "how to grow vegetables"
];

export const processSpeech = async (req: Request, res: Response) => {

    const { text } = req.body;
  if (!text) res.status(400).json({ error: "Text is required." });

  try {
    // 1. NLP using GROQ AI API to determine the best matching topic
    const prompt = `Given this agricultural question or statement: "${text}", pick the most relevant topic from the following list: ${candidateLabels.join(", " )}. Return only the best matching topic.`;

    const groqResponse = await axios.post(
      GROQ_API_URL,
      {
        model: "llama3-8b-8192",
        messages: [
          { role: "system", content: "You are an expert in agriculture and language understanding." },
          { role: "user", content: prompt }
        ],
        temperature: 0.3
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const topTopic = groqResponse.data.choices[0].message.content.trim();

    // 2. Search YouTube
    const { data } = await axios.get(YOUTUBE_API_URL, {
      params: {
        q: topTopic,
        key: YOUTUBE_API_KEY,
        maxResults: 5,
        part: "snippet",
        type: "video"
      }
    });

    // Return the list of video titles + URLs
    const videos = data.items.map(item => ({
      title: item.snippet.title,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`
    }));

    res.json({ topic: topTopic, videos });
  } catch (err) {
    console.error("AI processing error:", err.message);
    res.status(500).json({ error: "AI processing failed." });
  }

};
