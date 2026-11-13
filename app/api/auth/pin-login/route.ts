import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPin, verifyPin } from "@/lib/pin";
import { z } from "zod";

const PinAuthSchema = z.object({
  action: z.enum(["LOGIN", "REGISTER", "SET_INITIAL_PIN"]),
  phone: z.string().min(10, "সঠিক ফোন নম্বর দিন"),
  pin: z.string().min(4, "পিন কমপক্ষে ৪ সংখ্যার হতে হবে").max(6, "পিন সর্বোচ্চ ৬ সংখ্যার হতে হবে"),
  name: z.string().min(2, "নাম কমপক্ষে ২ অক্ষরের হতে হবে").optional(),
  email: z.string().email("সঠিক ইমেইল দিন").optional().or(z.literal("")),
});

function normalizePhone(rawPhone: string): string {
  let cleaned = rawPhone.replace(/\D/g, "");
  if (cleaned.startsWith("880")) {
    cleaned = cleaned.slice(2);
  }
  if (!cleaned.startsWith("0") && cleaned.length === 10) {
    cleaned = "0" + cleaned;
  }
  return cleaned;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = PinAuthSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { action, phone: rawPhone, pin, name, email } = parsed.data;
    const phone = normalizePhone(rawPhone);

    let user = await db.user.findFirst({
      where: {
        OR: [
          { phone },
          { phone: `+88${phone}` },
          { phone: phone.replace(/^0/, "+880") },
        ],
      },
    });

    if (action === "REGISTER") {
      if (user && user.pin) {
        return NextResponse.json(
          { error: "এই নম্বরে আগেই অ্যাকাউন্ট খোলা হয়েছে। অনুগ্রহ করে পিন দিয়ে লগইন করুন।" },
          { status: 400 }
        );
      }

      if (user && !user.pin) {
        // বিদ্যমান ইউজার কিন্তু আগে পিন সেট করা ছিল না
        user = await db.user.update({
          where: { id: user.id },
          data: {
            name: name || user.name,
            email: email || user.email || null,
            pin: hashPin(pin),
          },
        });
      } else {
        // সম্পূর্ণ নতুন ইউজার
        user = await db.user.create({
          data: {
            phone,
            name: name || `ব্যবহারকারী-${phone.slice(-4)}`,
            email: email || null,
            pin: hashPin(pin),
            role: "CAREGIVER",
            mode: "FAMILY",
          },
        });
      }
    } else if (action === "SET_INITIAL_PIN") {
      if (!user) {
        return NextResponse.json({ error: "ব্যবহারকারী পাওয়া যায়নি" }, { status: 404 });
      }

      user = await db.user.update({
        where: { id: user.id },
        data: {
          pin: hashPin(pin),
          email: email || user.email || null,
        },
      });
    } else {
      // LOGIN
      if (!user) {
        return NextResponse.json(
          { error: "এই ফোন নম্বরে কোনো অ্যাকাউন্ট পাওয়া যায়নি। অনুগ্রহ করে আগে নিবন্ধন করুন।" },
          { status: 404 }
        );
      }

      if (!user.pin) {
        return NextResponse.json(
          { needsInitialPin: true, message: "আপনার অ্যাকাউন্টে পিন সেট করা নেই। একটি নতুন ৪ ডিজিটের পিন দিন।" },
          { status: 200 }
        );
      }

      const isValid = verifyPin(pin, user.pin);
      if (!isValid) {
        return NextResponse.json(
          { error: "ভুল পিন দিয়েছেন। আবার চেষ্টা করুন।" },
          { status: 401 }
        );
      }
    }

    // ৩০ দিনের সেশন টোকেন তৈরি
    const sessionToken = crypto.randomUUID();
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

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
        email: user.email,
        role: user.role,
        mode: user.mode,
      },
    });

    // সেশন কুকি সেট
    response.cookies.set("authjs.session-token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("PIN auth error:", error);
    return NextResponse.json(
      { error: "লগইন সম্পন্ন করতে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}
