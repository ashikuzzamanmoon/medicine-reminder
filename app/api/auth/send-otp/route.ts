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

    // 6-digit OTP জেনারেট (Dev মোডে ফিক্সড অথবা র্যান্ডম)
    const otp = process.env.NODE_ENV === "development" ? "123456" : Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 5 * 60 * 1000); // ৫ মিনিট মেয়াদ

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

    // প্রোডাকশনে SSL Wireless API কল হবে, বর্তমানে Dev লগ
    console.log(`[OTP Engine] Generated OTP for ${phone}: ${otp}`);

    return NextResponse.json({
      success: true,
      message: "OTP পাঠানো হয়েছে",
      // Dev মোডে টেস্টিং সুবিধার জন্য ওটিপি ফিরিয়ে দেওয়া হচ্ছে
      ...(process.env.NODE_ENV === "development" ? { devOtp: otp } : {}),
    });
  } catch (error) {
    console.error("send-otp error:", error);
    return NextResponse.json(
      { error: "OTP পাঠাতে সমস্যা হয়েছে। আবার চেষ্টা করুন।" },
      { status: 500 }
    );
  }
}
