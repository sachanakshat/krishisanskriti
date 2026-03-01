import { NextRequest, NextResponse } from "next/server";

const PROMPT = `You are a content writer for "Krishi Sanskriti" (कृषि संस्कृति) — an Indian website about organic farming (जैविक खेती), healthy lifestyle (स्वस्थ जीवनशैली), and Sanatan Sanskriti (सनातन संस्कृति).

Watch this YouTube video carefully and generate blog post content. Return ONLY a valid JSON object (no markdown code fences, no extra text) with exactly these keys:

{
  "title": "Compelling English title (6-10 words, SEO-friendly)",
  "titleHi": "आकर्षक हिंदी शीर्षक (Devanagari, 6-10 शब्द)",
  "description": "English meta description: 2-3 sentences summarising the video for readers",
  "descriptionHi": "हिंदी संक्षेप: 2-3 वाक्यों में वीडियो का सार (Devanagari)",
  "blogContent": "Full Markdown blog post in English (500-700 words). Use ## for section headings, **bold** for key terms, - for bullet points. Include an Introduction, key takeaways/sections from the video, and a Conclusion.",
  "blogContentHi": "Full Markdown blog post in Hindi/Devanagari (500-700 words). Same structure as English version. All text must be in Devanagari script."
}`;

export async function POST(req: NextRequest) {
  try {
    const { videoId } = await req.json();

    if (!videoId || typeof videoId !== "string") {
      return NextResponse.json({ error: "videoId is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not set in .env.local" },
        { status: 500 }
      );
    }

    // gemini-1.5-flash-latest — has free tier quota; supports native YouTube URL understanding
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    const payload = {
      contents: [
        {
          parts: [
            {
              fileData: {
                fileUri: `https://www.youtube.com/watch?v=${videoId}`,
              },
            },
            { text: PROMPT },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.4,
        responseMimeType: "application/json",
      },
    };

    const geminiRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!geminiRes.ok) {
      const errBody = await geminiRes.json().catch(() => ({}));
      const message =
        errBody?.error?.message || `Gemini returned HTTP ${geminiRes.status}`;
      return NextResponse.json({ error: message }, { status: 502 });
    }

    const data = await geminiRes.json();
    const text: string | undefined =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return NextResponse.json(
        { error: "Gemini returned no content. The video may be private or unavailable." },
        { status: 502 }
      );
    }

    // Try to parse JSON — strip code fences if model included them
    const cleaned = text.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
    try {
      const parsed = JSON.parse(cleaned);
      return NextResponse.json(parsed);
    } catch {
      // Last resort: extract the first {...} block
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          const parsed = JSON.parse(match[0]);
          return NextResponse.json(parsed);
        } catch {
          /* fall through */
        }
      }
      return NextResponse.json(
        { error: "Could not parse Gemini response as JSON.", raw: text.slice(0, 500) },
        { status: 502 }
      );
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
