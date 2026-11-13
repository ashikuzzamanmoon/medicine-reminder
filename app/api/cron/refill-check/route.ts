import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendPushNotification } from "@/lib/push";

/**
 * প্রতিদিন সকাল ৯টায় চলবে (Vercel Cron)
 * যেসকল ওষুধের বর্তমান স্টক ৫ দিন বা তার কম দিনের বাকি আছে,
 * সেগুলোর জন্য কেয়ারগিভারদের কাছে REFILL_LOW পুশ অ্যালার্ট পাঠাবে।
 */
export async function GET() {
  try {
    // সক্রিয় ওষুধসমূহ যেগুলোতে স্টক কাউন্ট ট্র্যাকিং অন আছে
    const medicinesWithStock = await db.medicine.findMany({
      where: {
        isActive: true,
        stockCount: { not: null },
      },
      include: {
        schedules: {
          where: { isActive: true },
        },
        patientProfile: true,
      },
    });

    let alertsTriggered = 0;

    for (const med of medicinesWithStock) {
      const dailyDoseCount = med.schedules.length || 1;
      const currentStock = med.stockCount ?? 0;
      const daysRemaining = Math.floor(currentStock / dailyDoseCount);

      // ৫ দিনের কম মজুদ থাকলে অ্যালার্ট
      if (daysRemaining <= 5) {
        const patientUser = await db.user.findUnique({
          where: { id: med.patientProfile.userId },
          include: {
            patientLinks: {
              include: {
                caregiver: {
                  include: {
                    pushSubscriptions: true,
                  },
                },
              },
            },
          },
        });

        if (!patientUser) continue;

        const patientName = patientUser.name;
        const title = `📦 ওষুধের স্টক কম: ${med.name}`;
        const body = `${patientName}-এর ${med.name} ওষুধ মাত্র ${daysRemaining} দিনের (${currentStock}টি) অবশিষ্ট আছে। এখনই রিফিল অর্ডার করুন।`;

        for (const link of patientUser.patientLinks) {
          const caregiver = link.caregiver;
          for (const sub of caregiver.pushSubscriptions) {
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
                url: `/refill`,
                tag: `refill-${med.id}`,
              }
            );
            alertsTriggered++;
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      medicinesEvaluated: medicinesWithStock.length,
      refillAlertsSent: alertsTriggered,
    });
  } catch (error) {
    console.error("GET /api/cron/refill-check error:", error);
    return NextResponse.json(
      { error: "রিফিল চেক সম্পন্ন করতে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET();
}
