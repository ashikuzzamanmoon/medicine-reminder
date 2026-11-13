import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const CheckPhoneSchema = z.object({
  phone: z.string().min(10, "সঠিক ফোন নম্বর দিন"),
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
    const parsed = CheckPhoneSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const phone = normalizePhone(parsed.data.phone);

    const user = await db.user.findFirst({
      where: {
        OR: [
          { phone },
          { phone: `+88${phone}` },
          { phone: phone.replace(/^0/, "+880") },
        ],
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        pin: true,
      },
    });

    if (!user) {
      return NextResponse.json({
        exists: false,
        phone,
      });
    }

    return NextResponse.json({
      exists: true,
      phone: user.phone || phone,
      name: user.name,
      hasPin: Boolean(user.pin),
      maskedEmail: user.email
        ? user.email.replace(/(^.{2})(.*)(?=@)/, (_, a, b) => a + "*".repeat(b.length))
        : null,
    });
  } catch (error) {
    console.error("Check phone error:", error);
    return NextResponse.json(
      { error: "ফোন নম্বর যাচাই করতে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}

