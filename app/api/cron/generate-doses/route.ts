import { NextResponse } from "next/server";
import { generateDosesForDate } from "@/lib/scheduler";

export async function GET(req: Request) {
  try {
    // ক্রন সিক্রেট কি ভেরিফিকেশন (অপশনাল প্রোডাকশনে)
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");
    const targetDate = dateParam ? new Date(dateParam) : new Date();

    const result = await generateDosesForDate(targetDate);

    return NextResponse.json({
      success: true,
      message: "Dose Generation সম্পন্ন হয়েছে",
      ...result,
    });
  } catch (error) {
    console.error("GET /api/cron/generate-doses error:", error);
    return NextResponse.json(
      { error: "Dose তৈরি করতে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  return GET(req);
}

