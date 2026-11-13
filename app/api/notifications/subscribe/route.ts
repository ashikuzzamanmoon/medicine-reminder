import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { cookies } from "next/headers";

const SubscriptionSchema = z.object({
  userId: z.string().optional(),
  endpoint: z.string().url("সঠিক endpoint দিন"),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

async function resolveUserId(providedId?: string): Promise<string | null> {
  if (providedId) return providedId;

  const cookieStore = cookies();
  const sessionToken = cookieStore.get("authjs.session-token")?.value;

  if (sessionToken) {
    const session = await db.session.findUnique({
      where: { sessionToken },
      select: { userId: true },
    });
    if (session?.userId) return session.userId;
  }

  const latestUser = await db.user.findFirst({
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });

  return latestUser?.id || null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = SubscriptionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { userId: providedId, endpoint, keys } = parsed.data;
    const userId = await resolveUserId(providedId);

    if (!userId) {
      return NextResponse.json(
        { error: "ইউজার পাওয়া যায়নি" },
        { status: 404 }
      );
    }

    // একই এন্ডপয়েন্ট আগে থাকলে আপডেট, নাহলে তৈরি
    const subscription = await db.pushSubscription.upsert({
      where: { endpoint },
      update: {
        userId,
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
      create: {
        userId,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Push Subscription সফলভাবে সংরক্ষিত হয়েছে",
      id: subscription.id,
    });
  } catch (error) {
    console.error("Push subscribe error:", error);
    return NextResponse.json(
      { error: "সাবস্ক্রিপশন সংরক্ষণ করতে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}
