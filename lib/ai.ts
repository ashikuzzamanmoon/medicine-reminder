import { GoogleGenAI } from "@google/genai";
import { PrescriptionDraft, PrescriptionDraftSchema } from "@/lib/prescription-schema";

const apiKey = process.env.GEMINI_API_KEY || "";

/**
 * প্রেসক্রিপশনের ছবি প্রসেস করে খসড়া (Draft) তৈরি করে।
 * Non-negotiable: এটি সরাসরি DB-তে সেভ হবে না — ব্যবহারকারী রিভিউ করবেন।
 */
export async function analyzePrescriptionImage(base64Image: string, mimeType: string): Promise<PrescriptionDraft> {
  if (!apiKey || apiKey === "your-gemini-api-key") {
    // API কি না থাকলে সিমুলেটেড সেফ ড্রাফট ফেরত দেওয়া (Dev মোড টেস্টিংয়ের জন্য)
    return {
      medicines: [
        {
          name: "Seclo 20mg",
          dose: "১টি ক্যাপসুল",
          foodTiming: "BEFORE",
          times: ["08:00", "20:00"],
          durationDays: 30,
          confidence: "high",
        },
        {
          name: "Napa Extra 500mg",
          dose: "১টি ট্যাবলেট",
          foodTiming: "AFTER",
          times: ["13:00", "21:00"],
          durationDays: 7,
          confidence: "medium",
        },
      ],
      rawSummary: "প্রেসক্রিপশন থেকে ২টি ওষুধ সফলভাবে শনাক্ত করা হয়েছে।",
      warnings: [
        "সতর্কতা: ডাক্তারদের হাতের লেখা অস্পষ্ট হতে পারে। প্রতিটি ওষুধের নাম ও সময়সূচি নিশ্চিত হয়ে সেভ করুন।",
      ],
    };
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
You are a medical assistant reviewing a doctor's prescription image for a patient in Bangladesh.
Extract all prescribed medicines into structured JSON.
For each medicine:
- name: Brand name or generic name (e.g., Seclo 20mg, Napa)
- dose: Amount per intake in Bengali or English (e.g., "১টি ট্যাবলেট", "5ml")
- foodTiming: "BEFORE" (খাবারের আগে) | "AFTER" (খাবারের পরে) | "ANY"
- times: Array of daily 24-hr format times like ["08:00", "20:00"]
- durationDays: Number of days prescribed if mentioned
- confidence: "high" | "medium" | "low"

Provide honest warnings about unreadable lines or doctor handwriting.
Return pure JSON with keys: medicines, rawSummary, warnings.
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType,
              data: base64Image,
            },
          },
        ],
      },
    ],
  });

  const responseText = response.text || "{}";
  // JSON পার্সিং
  const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

  try {
    const rawData = JSON.parse(cleanJson);
    const validated = PrescriptionDraftSchema.parse(rawData);
    return validated;
  } catch (err) {
    console.error("Gemini JSON parse failed, returning fallback draft:", err);
    return {
      medicines: [],
      rawSummary: responseText.slice(0, 300),
      warnings: ["AI প্রেসক্রিপশনের তথ্য পড়তে পারেনি। অনুগ্রহ করে হাতে ওষুধ যোগ করুন।"],
    };
  }
}
