import { HEIGHT, WIDTH } from "@/constants";
import { RequestProps } from "@/interfaces";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (request: NextApiRequest, response: NextApiResponse) => {
  if (request.method !== "POST") {
    return response.status(405).json({ error: "Method not allowed" });
  }

  const gptApiKey = process.env.GPT_API_KEY || process.env.NEXT_PUBLIC_GPT_API_KEY;
  const gptUrl = "https://chatgpt-42.p.rapidapi.com/texttoimage";

  if (!gptApiKey) {
    return response.status(500).json({ error: "GPT_API_KEY is missing in environment variables" });
  }

  try {
    const { prompt }: RequestProps = request.body || {};
    const cleanedPrompt = (prompt || "").trim();

    if (!cleanedPrompt) {
      return response.status(400).json({ error: "Prompt is required" });
    }

    const res = await fetch(gptUrl, {
      method: "POST",
      body: JSON.stringify({
        text: cleanedPrompt,
        width: WIDTH,
        height: HEIGHT,
      }),
      headers: {
        "x-rapidapi-key": gptApiKey.trim(),
        "x-rapidapi-host": "chatgpt-42.p.rapidapi.com",
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Upstream error:", res.status, errorText);
      return response.status(res.status).json({ error: "Failed to fetch from image service" });
    }

    const data = await res.json();

    return response.status(200).json({
      message: data?.generated_image || "https://via.placeholder.com/600x400?text=Generated+Image",
    });
  } catch (error) {
    console.error("Error in API route:", error);
    return response.status(500).json({ error: "Internal server error" });
  }
};

export default handler;