import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendPushNotification } from "@/lib/push";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get("authjs.session-token")?.value;

    let user = null;
    if (sessionToken) {
      const session = await db.session.findUnique({
        where: { sessionToken },
        include: { user: true },
      });
      user = session?.user;
    }

    if (!user) {
      user = await db.user.findFirst({
        orderBy: { createdAt: "desc" },
      });
    }

    if (!user) {
      return NextResponse.json({ error: "কোনো ইউজার পাওয়া যায়নি" }, { status: 404 });
    }

    // ইউজারের সব সাবস্ক্রিপশন বের করা
    const subscriptions = await db.pushSubscription.findMany({
      where: { userId: user.id },
    });

    if (subscriptions.length === 0) {
      return NextResponse.json(
        { error: "এই ডিভাইসে এখনও নোটিফিকেশন সাবস্ক্রাইব করা হয়নি। আগে 'নোটিফিকেশন চালু করুন' চাপুন।" },
        { status: 400 }
      );
    }

    let sentCount = 0;
    for (const sub of subscriptions) {
      const res = await sendPushNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        },
        {
          title: "🔔 টেস্ট নোটিফিকেশন সফল!",
          body: "আপনার ফোনে ওষুধ রিমাইন্ডারের নোটিফিকেশন সক্রিয় হয়েছে। সময়মতো অ্যালার্ট পাবেন।",
          url: "/dashboard",
          type: "INFO",
          showActions: false,
        }
      );
      if (res.success) {
        sentCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `${sentCount}টি ডিভাইসে টেস্ট নোটিফিকেশন পাঠানো হয়েছে!`,
    });
  } catch (error) {
    console.error("Test notification error:", error);
    return NextResponse.json(
      { error: "টেস্ট নোটিফিকেশন পাঠাতে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}

