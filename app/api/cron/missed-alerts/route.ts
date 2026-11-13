import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendPushNotification } from "@/lib/push";

/**
 * প্রতি ৫ মিনিটে চলবে (Vercel Cron)
 * মিসড ডোজ এসকেলেশন পলিসি:
 * ১. নির্ধারিত সময় + ৩০ মিনিট পার হয়ে গেলে: MISSED_FIRST অ্যালার্ট যাবে কেয়ারগিভারদের কাছে
 * ২. নির্ধারিত সময় + ৬০ মিনিট পার হয়ে গেলে: MISSED_ESCALATION (জরুরি) অ্যালার্ট যাবে
 */
export async function GET() {
  try {
    const now = new Date();
    const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000);
    const sixtyMinAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // যে ডোজগুলো এখনও PENDING কিন্তু ৩০ মিনিট আগে খাওয়ার কথা ছিল
    const missedDoses = await db.dose.findMany({
      where: {
        status: "PENDING",
        scheduledAt: {
          gte: dayAgo,
          lte: thirtyMinAgo,
        },
      },
      include: {
        alerts: true,
        schedule: {
          include: {
            medicine: {
              include: {
                patientProfile: true,
              },
            },
          },
        },
      },
    });

    let alertsSent = 0;

    for (const dose of missedDoses) {
      const patientUserId = dose.schedule.medicine.patientProfile.userId;
      const medicineName = dose.schedule.medicine.name;

      // রোগীর তথ্য ও সম্পর্কযুক্ত কেয়ারগিভারদের বের করা
      const patientUser = await db.user.findUnique({
        where: { id: patientUserId },
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
      const scheduledTimeStr = dose.schedule.time;

      // ইতোমধ্যে পাঠানো অ্যালার্টের ধরন চেক
      const hasFirstAlert = dose.alerts.some((a) => a.type === "MISSED_FIRST");
      const hasEscalationAlert = dose.alerts.some((a) => a.type === "MISSED_ESCALATION");

      let alertTypeToSend: "MISSED_FIRST" | "MISSED_ESCALATION" | null = null;
      let alertTitle = "";
      let alertBody = "";

      if (dose.scheduledAt <= sixtyMinAgo && !hasEscalationAlert) {
        // ৬০ মিনিট পার হয়ে গেছে -> জরুরি এসকেলেশন
        alertTypeToSend = "MISSED_ESCALATION";
        alertTitle = `🚨 জরুরি: ${patientName} এখনও ওষুধ খাননি!`;
        alertBody = `${patientName} ১ ঘণ্টা ধরে ${medicineName} (${scheduledTimeStr} ছিল) গ্রহণ করেননি। অনুগ্রহ করে কল করে খোঁজ নিন।`;
      } else if (dose.scheduledAt <= thirtyMinAgo && !hasFirstAlert) {
        // ৩০ মিনিট পার হয়েছে -> প্রথম মিসড অ্যালার্ট
        alertTypeToSend = "MISSED_FIRST";
        alertTitle = `⚠️ সতর্কবার্তা: ${patientName} ওষুধ খাননি`;
        alertBody = `${patientName} নির্ধারিত সময়ে (${scheduledTimeStr}) ${medicineName} এখনও নেননি।`;
      }

      if (!alertTypeToSend) continue;

      // কেয়ারগিভারদের কাছে অ্যালার্ট পাঠানো
      for (const link of patientUser.patientLinks) {
        const caregiver = link.caregiver;

        // ডাটাবেসে Alert রেকর্ড সেভ
        await db.alert.create({
          data: {
            doseId: dose.id,
            userId: caregiver.id,
            type: alertTypeToSend,
            delivered: caregiver.pushSubscriptions.length > 0,
          },
        });

        // পুশ নোটিফিকেশন পাঠানো
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
              title: alertTitle,
              body: alertBody,
              url: `/dashboard`,
              tag: `alert-${dose.id}-${alertTypeToSend}`,
            }
          );
          alertsSent++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      missedDosesEvaluated: missedDoses.length,
      alertsDispatched: alertsSent,
    });
  } catch (error) {
    console.error("GET /api/cron/missed-alerts error:", error);
    return NextResponse.json(
      { error: "মিসড অ্যালার্ট পাঠাতে ব্যর্থ" },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET();
}

