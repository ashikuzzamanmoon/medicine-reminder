import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPin } from "@/lib/pin";
import { z } from "zod";

const ResetPinSchema = z.object({
  phone: z.string().min(10, "সঠিক ফোন নম্বর দিন"),
  email: z.string().email("সঠিক ইমেইল দিন"),
  resetCode: z.string().min(4, "কোড দিন"),
  newPin: z.string().min(4, "নতুন পিন কমপক্ষে ৪ সংখ্যার হতে হবে").max(6, "নতুন পিন সর্বোচ্চ ৬ সংখ্যার হতে হবে"),
});

function normalizePhone(rawPhone: string): string {
  let cleaned = rawPhone.replace(/\D/g, "");
  if (cleaned.startsWith("880")) cleaned = cleaned.slice(2);
  if (!cleaned.startsWith("0") && cleaned.length === 10) cleaned = "0" + cleaned;
  return cleaned;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = ResetPinSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { phone: rawPhone, email, resetCode, newPin } = parsed.data;
    const phone = normalizePhone(rawPhone);

    const user = await db.user.findFirst({
      where: {
        OR: [
          { phone },
          { phone: `+88${phone}` },
          { phone: phone.replace(/^0/, "+880") },
        ],
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "এই ফোন নম্বরে কোনো অ্যাকাউন্ট পাওয়া যায়নি" },
        { status: 404 }
      );
    }

    // ইমেইল ম্যাচ করে কি না দেখা (যদি ইউজারের আগে থেকেই ইমেইল সেভ থাকে)
    if (user.email && user.email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        { error: "আপনার দেওয়া ইমেইল এই অ্যাকাউন্টের সাথে মিলছে না।" },
        { status: 400 }
      );
    }

    // ওটিপি / কোড ভেরিফিকেশন (বর্তমান ডেমো কোড ১২৩৪৫৬ অথবা ডেটাবেজ টোকেন)
    if (resetCode !== "123456") {
      return NextResponse.json(
        { error: "ভেরিফিকেশন কোডটি সঠিক নয়। (টেস্ট কোড: 123456)" },
        { status: 400 }
      );
    }

    // নতুন পিন ও ইমেইল আপডেট
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        pin: hashPin(newPin),
        email: email.toLowerCase(),
      },
    });

    // নতুন সেশন তৈরি ও লগইন
    const sessionToken = crypto.randomUUID();
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await db.session.create({
      data: {
        sessionToken,
        userId: updatedUser.id,
        expires,
      },
    });

    const response = NextResponse.json({
      success: true,
      message: "পিন সফলভাবে পরিবর্তন করা হয়েছে এবং লগইন সম্পন্ন হয়েছে!",
    });

    response.cookies.set("authjs.session-token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Reset PIN error:", error);
    return NextResponse.json(
      { error: "পিন রিসেট করতে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}
