import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SendOtpSchema } from "@/lib/auth-schema";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = SendOtpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { phone } = parsed.data;

    // 6-digit OTP জেনারেট (পেইড SMS API ছাড়া যেন যে কেউ বা পাইলট টেস্টার টেস্ট করতে পারে)
    const otp = "123456";
    const expires = new Date(Date.now() + 10 * 60 * 1000); // ১০ মিনিট মেয়াদ

    // আগের কোনো OTP থাকলে ডিলিট করে নতুনটা সেভ করি
    await db.verificationToken.deleteMany({
      where: { identifier: phone },
    });

    await db.verificationToken.create({
      data: {
        identifier: phone,
        token: otp,
        expires,
      },
    });

    console.log(`[OTP Engine] Generated OTP for ${phone}: ${otp}`);

    return NextResponse.json({
      success: true,
      message: "OTP পাঠানো হয়েছে",
      devOtp: otp, // স্ক্রিনে স্পষ্ট দেখানোর জন্য
    });
  } catch (error) {
    console.error("send-otp error:", error);
    return NextResponse.json(
      { error: "OTP পাঠাতে সমস্যা হয়েছে। আবার চেষ্টা করুন।" },
      { status: 500 }
    );
  }
}
