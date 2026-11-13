import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // ১. মোট ইউজার ও ভূমিকা অনুযায়ী বিভাজন
    const [
      totalUsers,
      totalCaregivers,
      totalPatients,
      totalMedicines,
      totalDosesLogged,
      activeSessionsCount,
      recentUsers,
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { role: "CAREGIVER" } }),
      db.user.count({ where: { role: "PATIENT" } }),
      db.medicine.count({ where: { isActive: true } }),
      db.dose.count(),
      // একটিভ সেশন (যেগুলোর মেয়াদ শেষ হয়নি)
      db.session.count({ where: { expires: { gt: now } } }),
      // সাম্প্রতিক ৫ জন ইউজার
      db.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          phone: true,
          role: true,
          mode: true,
          createdAt: true,
        },
      }),
    ]);

    // ২. আজকের ডোজ অ্যানালিটিক্স
    const todayDoses = await db.dose.findMany({
      where: {
        scheduledAt: { gte: todayStart },
      },
      select: { status: true },
    });

    const todayTotal = todayDoses.length;
    const todayTaken = todayDoses.filter((d) => d.status === "TAKEN" || d.status === "LATE").length;
    const todayMissed = todayDoses.filter((d) => d.status === "MISSED").length;

    // ৩. গত ৭ দিনে নতুন সাইনআপ
    const newUsersLast7Days = await db.user.count({
      where: { createdAt: { gte: sevenDaysAgo } },
    });

    // ৪. পুশ নোটিফিকেশন সাবস্ক্রাইবার সংখ্যা
    const pushSubscribersCount = await db.pushSubscription.count();

    return NextResponse.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          caregivers: totalCaregivers,
          patients: totalPatients,
          activeNow: activeSessionsCount,
          newLast7Days: newUsersLast7Days,
        },
        medicines: {
          activeTotal: totalMedicines,
          dosesTracked: totalDosesLogged,
        },
        todayActivity: {
          totalDoses: todayTotal,
          takenDoses: todayTaken,
          missedDoses: todayMissed,
          complianceRate: todayTotal > 0 ? Math.round((todayTaken / todayTotal) * 100) : 100,
        },
        pushSubscribers: pushSubscribersCount,
        recentUsers,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/stats error:", error);
    return NextResponse.json({ error: "অ্যাডমিন পরিসংখ্যান লোড করতে ব্যর্থ" }, { status: 500 });
  }
}
