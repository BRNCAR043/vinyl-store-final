import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface VinylSummary {
  index: number;
  id: string;
  albumName: string;
  artist: string;
  genres?: string;
  description?: string;
  tags?: string;
}

export async function POST(request: Request) {
  try {
    const { query, vinyls, image } = await request.json();

    if ((!query || typeof query !== "string") && !image) {
      return NextResponse.json(
        { error: "Query or image is required" },
        { status: 400 }
      );
    }

    if (!vinyls || !Array.isArray(vinyls) || vinyls.length === 0) {
      return NextResponse.json({ indices: [] });
    }

    // Create a summary of all vinyls for OpenAI to analyze
    const vinylSummaries: VinylSummary[] = vinyls.map((v: any, index: number) => ({
      index,
      id: v.id,
      albumName: v.albumName || "",
      artist: v.artist || "",
      genres: v.genres || "",
      description: v.description || "",
      tags: Array.isArray(v.tags) ? v.tags.join(", ") : "",
    }));

    let completion;

    if (image) {
      // Image-based search using GPT-4o vision
      const imagePrompt = `You are a vinyl record recommender. Analyze this image and determine what kind of music, mood, or vibe it represents. Then, from the following vinyl records, select EXACTLY 8 that best match the feeling, theme, or aesthetic of the image.

${query ? `Additional context from user: "${query}"` : ""}

Available vinyls (in JSON format):
${JSON.stringify(vinylSummaries, null, 2)}

IMPORTANT: Return ONLY a JSON array of the 8 most relevant vinyl indices (the "index" field), ordered from most relevant to least relevant. Do not include any explanation or other text. Just the JSON array of numbers.

Example response format: [0, 5, 12, 3, 7, 2, 9, 1]

If there are fewer than 8 vinyls, return all available indices.`;

      completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: imagePrompt },
              {
                type: "image_url",
                image_url: {
                  url: image,
                  detail: "low",
                },
              },
            ],
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
      });
    } else {
      // Text-based search
      const textPrompt = `You are a vinyl record recommender. Given the user's request, analyze the following vinyl records and return EXACTLY 8 that best match what the user is looking for.

User's request: "${query}"

Available vinyls (in JSON format):
${JSON.stringify(vinylSummaries, null, 2)}

IMPORTANT: Return ONLY a JSON array of the 8 most relevant vinyl indices (the "index" field), ordered from most relevant to least relevant. Do not include any explanation or other text. Just the JSON array of numbers.

Example response format: [0, 5, 12, 3, 7, 2, 9, 1]

If there are fewer than 8 vinyls, return all available indices.`;

      completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: textPrompt }],
        temperature: 0.3,
      });
    }

    const text = completion.choices[0]?.message?.content || "";

    // Parse the response to get indices
    let indices: number[] = [];
    try {
      // Extract JSON array from response (in case there's extra text)
      const match = text.match(/\[[\d,\s]+\]/);
      if (match) {
        indices = JSON.parse(match[0]);
      }
    } catch {
      console.error("Failed to parse OpenAI response:", text);
      // Fallback: return first 8 vinyls
      indices = vinyls.slice(0, 8).map((_: any, i: number) => i);
    }

    // Return the indices - the client will map them back to vinyls
    return NextResponse.json({ indices: indices.slice(0, 8) });
  } catch (error) {
    console.error("AI Search error:", error);
    return NextResponse.json(
      { error: "Failed to perform search", details: String(error) },
      { status: 500 }
    );
  }
}

// Keep GET for health check
export async function GET() {
  return NextResponse.json({ status: "AI Search endpoint ready" });
}