import { NextResponse } from "next/server";
import { analyzePrescriptionImage } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "প্রেসক্রিপশনের ছবি আপলোড করুন" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");
    const mimeType = file.type || "image/jpeg";

    // Vision AI খসড়া এক্সট্রাকশন
    const draft = await analyzePrescriptionImage(base64Image, mimeType);

    return NextResponse.json({
      success: true,
      message: "প্রেসক্রিপশন বিশ্লেষণ সম্পন্ন হয়েছে। দয়া করে তথ্য যাচাই করুন।",
      draft,
    });
  } catch (error) {
    console.error("Prescription analyze error:", error);
    return NextResponse.json(
      { error: "প্রেসক্রিপশন প্রসেস করতে ব্যর্থ হয়েছে" },
      { status: 500 }
    );
  }
}

