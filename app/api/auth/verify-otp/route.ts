import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { VerifyOtpSchema } from "@/lib/auth-schema";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = VerifyOtpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { phone, otp, name } = parsed.data;

    // টোকেন ভ্যালিডেশন চেক
    const record = await db.verificationToken.findFirst({
      where: {
        identifier: phone,
        token: otp,
        expires: { gt: new Date() },
      },
    });

    if (!record) {
      return NextResponse.json(
        { error: "ভুল অথবা মেয়াদোত্তীর্ণ OTP। আবার চেষ্টা করুন।" },
        { status: 400 }
      );
    }

    // টোকেন ব্যবহার হয়ে গেলে ডিলিট
    await db.verificationToken.deleteMany({
      where: { identifier: phone },
    });

    // ব্যবহারকারী আগে থেকে আছে কিনা দেখা
    let user = await db.user.findUnique({
      where: { phone },
    });

    if (!user) {
      user = await db.user.create({
        data: {
          phone,
          name: name || `ব্যবহারকারী-${phone.slice(-4)}`,
          role: "CAREGIVER",
          mode: "FAMILY",
        },
      });
    }

    // সেশন তৈরি করা
    const sessionToken = crypto.randomUUID();
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // ৩০ দিন

    await db.session.create({
      data: {
        sessionToken,
        userId: user.id,
        expires,
      },
    });

    const response = NextResponse.json({
      success: true,
      message: "লগইন সফল হয়েছে",
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        mode: user.mode,
      },
    });

    // সেশন কুকি সেট করা
    response.cookies.set("authjs.session-token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("verify-otp error:", error);
    return NextResponse.json(
      { error: "যাচাইকরণে সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}
