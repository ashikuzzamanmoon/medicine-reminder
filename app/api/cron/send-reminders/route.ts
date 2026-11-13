import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendPushNotification } from "@/lib/push";

/**
 * প্রতি মিনিটে চলবে (Vercel Cron)
 * ১. যেসকল ডোজের সময় হয়েছে (scheduledAt <= now()) এবং স্ট্যাটাস PENDING
 * ২. রোগীর সাবস্ক্রিপশনে পুশ নোটিফিকেশন পাঠাবে (বাংলা ভয়েস টেক্সট সহ)
 */
export async function GET() {
  try {
    const now = new Date();
    // গত ৩ ঘণ্টার মধ্যে নির্ধারিত কিন্তু এখনও PENDING এমন ডোজ খোঁজা
    const windowStart = new Date(now.getTime() - 3 * 60 * 60 * 1000);

    const pendingDoses = await db.dose.findMany({
      where: {
        status: "PENDING",
        scheduledAt: {
          gte: windowStart,
          lte: now,
        },
      },
      include: {
        schedule: {
          include: {
            medicine: {
              include: {
                patientProfile: {
                  include: {
                    // রোগীকে কেয়ার করে এমন ব্যবহারকারী বা রোগীর নিজস্ব অ্যাকাউন্ট
                  },
                },
              },
            },
          },
        },
      },
    });

    let sentCount = 0;

    for (const dose of pendingDoses) {
      const medicine = dose.schedule.medicine;
      const patientUserId = medicine.patientProfile.userId;

      // রোগীর ব্যবহারকারী তথ্য
      const patientUser = await db.user.findUnique({
        where: { id: patientUserId },
        include: {
          pushSubscriptions: true,
        },
      });

      if (!patientUser) continue;

      const patientName = patientUser.name;
      const medicineName = medicine.name;
      const doseAmount = medicine.dose;
      const timingText = medicine.foodTiming === "BEFORE" ? "খাবারের আগে" : medicine.foodTiming === "AFTER" ? "খাবারের পরে" : "";

      const title = `💊 ওষুধ খাওয়ার সময় হয়েছে`;
      const body = `${patientName}, এখন আপনার ${medicineName} (${doseAmount}) নেওয়ার সময়। ${timingText}`;
      const speakText = `${patientName}, এখন আপনার ${medicineName} ওষুধের সময়। ডোজ ${doseAmount}।`;

      // রোগীর নিবন্ধিত ডিভাইসে পুশ পাঠানো
      for (const sub of patientUser.pushSubscriptions) {
        await sendPushNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          {
            title,
            body,
            url: `/reminder?doseId=${dose.id}`,
            speakText,
            tag: `dose-${dose.id}`,
          }
        );
        sentCount++;
      }
    }

    return NextResponse.json({
      success: true,
      pendingDosesFound: pendingDoses.length,
      notificationsSent: sentCount,
    });
  } catch (error) {
    console.error("GET /api/cron/send-reminders error:", error);
    return NextResponse.json(
      { error: "রিমাইন্ডার পুশ পাঠাতে ব্যর্থ" },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET();
}
