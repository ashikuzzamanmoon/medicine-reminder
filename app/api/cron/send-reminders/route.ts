import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendPushNotification } from "@/lib/push";
import { formatBanglaVoiceTime } from "@/lib/timezone";

// Vercel Serverless-এ প্রতিবার রিয়েল-টাইম এক্সিকিউশন নিশ্চিত করতে force-dynamic
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * প্রতি মিনিটে চলবে (Vercel Cron / cron-job.org)
 * ১. যেসকল ডোজের সময় হয়েছে (scheduledAt <= now()) এবং স্ট্যাটাস PENDING এবং এখনও নোটিফিকেশন পাঠানো হয়নি (reminderSentAt: null)
 * ২. রোগীর ও সংশ্লিষ্ট কেয়ারগিভারদের সাবস্ক্রিপশনে পুশ নোটিফিকেশন পাঠাবে
 * ৩. নোটিফিকেশন সফলভাবে সম্পন্ন হলে reminderSentAt মার্ক করবে
 */
export async function GET() {
  try {
    const now = new Date();
    // গত ৩ ঘণ্টার মধ্যে নির্ধারিত কিন্তু এখনও PENDING এমন ডোজ খোঁজা
    const windowStart = new Date(now.getTime() - 3 * 60 * 60 * 1000);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const doseModel = (db as any).dose;

    const pendingDoses = await doseModel.findMany({
      where: {
        status: "PENDING",
        reminderSentAt: null,
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
                patientProfile: true,
              },
            },
          },
        },
      },
    });

    let sentCount = 0;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const dose of (pendingDoses as any[])) {
      try {
        const medicine = dose.schedule?.medicine;
        if (!medicine || !medicine.patientProfile) {
          // ইনভ্যালিড বা অসম্পূর্ণ ডাটা থাকলে এটি মার্ক করে স্কিপ করা
          await doseModel.update({
            where: { id: dose.id },
            data: { reminderSentAt: new Date() },
          });
          continue;
        }

        const patientUserId = medicine.patientProfile.userId;

        // রোগীর তথ্য এবং সংশ্লিষ্ট কেয়ারগিভারদের বের করা
        const patientUser = await db.user.findUnique({
          where: { id: patientUserId },
          include: {
            pushSubscriptions: true,
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

        if (!patientUser) {
          await doseModel.update({
            where: { id: dose.id },
            data: { reminderSentAt: new Date() },
          });
          continue;
        }

        const patientName = patientUser.name;
        const medicineName = medicine.name;
        const doseAmount = medicine.dose;
        const timingText =
          medicine.foodTiming === "BEFORE"
            ? "খাবারের আগে"
            : medicine.foodTiming === "AFTER"
            ? "খাবারের পরে"
            : "";

        const timeVoice = formatBanglaVoiceTime(dose.schedule.time);

        // ১. রোগীর নিবন্ধিত ডিভাইসে পুশ পাঠানো
        for (const sub of patientUser.pushSubscriptions) {
          try {
            const res = await sendPushNotification(
              {
                endpoint: sub.endpoint,
                keys: {
                  p256dh: sub.p256dh,
                  auth: sub.auth,
                },
              },
              {
                title: `💊 ওষুধ খাওয়ার সময় হয়েছে`,
                body: `${patientName}, ${timeVoice} আপনার ${medicineName} (${doseAmount}) নেওয়ার সময়। ${timingText}`,
                url: `/reminder?doseId=${dose.id}`,
                speakText: `${patientName}, ${timeVoice} আপনার ${medicineName} ওষুধের সময়। ডোজ ${doseAmount}।`,
                tag: `dose-${dose.id}`,
                type: "REMINDER",
                showActions: true,
                doseId: dose.id,
              }
            );
            if (res.success) {
              sentCount++;
            }
          } catch (pushErr) {
            console.error("Patient push notification failed:", pushErr);
          }
        }

        // ২. সংশ্লিষ্ট কেয়ারগিভারদের ডিভাইসে পুশ পাঠানো (পারিবারিক তত্ত্বাবধান নিশ্চিত করতে)
        for (const link of patientUser.patientLinks) {
          const caregiver = link.caregiver;
          if (!caregiver || !caregiver.pushSubscriptions) continue;

          for (const sub of caregiver.pushSubscriptions) {
            try {
              const res = await sendPushNotification(
                {
                  endpoint: sub.endpoint,
                  keys: {
                    p256dh: sub.p256dh,
                    auth: sub.auth,
                  },
                },
                {
                  title: `💊 ${patientName}-এর ওষুধ দেওয়ার সময় হয়েছে`,
                  body: `${patientName}-কে এখন ${medicineName} (${doseAmount}) সেবন করান। ${timingText}`,
                  url: `/dashboard`,
                  tag: `dose-${dose.id}-cg`,
                  type: "INFO",
                  showActions: false,
                  doseId: dose.id,
                }
              );
              if (res.success) {
                sentCount++;
              }
            } catch (cgPushErr) {
              console.error("Caregiver push notification failed:", cgPushErr);
            }
          }
        }

        // একবার পুশ পাঠানো হলে Dose-এ reminderSentAt সেভ করা যাতে প্রতি মিনিটে স্প্যাম নোটিফিকেশন না পাঠায়
        await doseModel.update({
          where: { id: dose.id },
          data: { reminderSentAt: new Date() },
        });
      } catch (doseErr) {
        console.error(`Error processing dose ${dose.id}:`, doseErr);
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
      { error: "রিমাইন্ডার পুশ পাঠাতে ব্যর্থ", details: error instanceof Error ? error.message : "অজানা সমস্যা" },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET();
}
