import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * বাংলা টেক্সট-টু-স্পিচ (TTS) অডিও প্রক্সি
 * উইন্ডোজ পিসি বা ডিভাইসে যেখানে বাংলা ভয়েস ইঞ্জিন ইনস্টল নেই, সেখানে স্পষ্ট বাংলা অডিও নিশ্চিত করে।
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const text = searchParams.get("text");

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // সর্বোচ্চ ২০০ ক্যারেক্টার পর্যন্ত পাঠাবে
    const safeText = text.trim().slice(0, 250);
    const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=bn&client=tw-ob&q=${encodeURIComponent(
      safeText
    )}`;

    const response = await fetch(googleTtsUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `TTS service responded with status ${response.status}` },
        { status: 502 }
      );
    }

    const audioBuffer = await response.arrayBuffer();

    return new Response(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch (error) {
    console.error("GET /api/tts error:", error);
    return NextResponse.json({ error: "TTS generation failed" }, { status: 500 });
  }
}

