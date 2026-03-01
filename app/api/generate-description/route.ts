// Small utility endpoint to generate a short product description for a vinyl
// record using OpenAI. Input JSON should include `title` and optionally
// `artist`. Returns `{ description: string }` or an error response.
import OpenAI from "openai";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const title = body?.title;
    const artist = body?.artist;
    if (!title) {
      return new Response(JSON.stringify({ error: "Title is required" }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Create an OpenAI client instance per-request. Using the environment
    // variable keeps the key out of source control.
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const safeTitle = String(title).trim();
    const safeArtist = artist ? String(artist).trim() : undefined;
    const prompt = safeArtist
      ? `Generate a short, evocative two-sentence product description for the album "${safeTitle}" by ${safeArtist}. Keep it concise and suitable for a retail listing.`
      : `Generate a short, evocative two-sentence product description for the album "${safeTitle}". Keep it concise and suitable for a retail listing.`;

    // Prefer the newer Responses API when available (OpenAI JS v6+). If the
    // SDK in this environment doesn't support it we fall back to chat
    // completions. Both branches return a short generated string.
    let desc = "";
    try {
      const resp = await (client as any).responses.create({ model: "gpt-3.5-turbo", input: prompt, max_tokens: 200 });
      // responses API returns output array with content
      const out = resp?.output?.[0];
      if (out) {
        if (typeof out === "string") desc = out.trim();
        else if (Array.isArray(out?.content)) {
          // join text parts
          desc = out.content.map((c: any) => c?.text || c?.plain_text || "").join(" ").trim();
        } else {
          desc = String(out).trim();
        }
      }
    } catch (e) {
      // fallback to chat completions if responses API isn't available
      const completion = await (client as any).chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 200,
      });
      desc = completion?.choices?.[0]?.message?.content?.trim() || "";
    }

    return new Response(JSON.stringify({ description: desc }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    console.error("Generate description error:", err?.message || err, err);
    const message = err?.message || "Failed to generate description";
    // If OpenAI SDK surfaced a rate/quota error status, forward it
    const statusCode = err?.status === 429 ? 429 : 500;
    return new Response(JSON.stringify({ error: message }), { status: statusCode, headers: { 'Content-Type': 'application/json' } });
  }
}