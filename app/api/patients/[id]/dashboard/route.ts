import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateDosesForDate } from "@/lib/scheduler";
import { getBangladeshDayBounds } from "@/lib/timezone";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const patientUserId = params.id;

    // প্যারালালভাবে ইউজার ও প্রোফাইল কোয়েরি করা
    const [patient, profile] = await Promise.all([
      db.user.findUnique({
        where: { id: patientUserId },
      }),
      db.patientProfile.findFirst({
        where: {
          OR: [{ userId: patientUserId }, { id: patientUserId }],
        },
        include: {
          medicines: {
            where: { isActive: true },
            include: {
              schedules: {
                where: { isActive: true },
              },
            },
          },
        },
      }),
    ]);

    if (!patient && !profile) {
      return NextResponse.json({ error: "রোগী পাওয়া যায়নি" }, { status: 404 });
    }

    const patientName = patient?.name || "রোগী";
    const patientPhone = patient?.phone || null;

    // আজকের দিনের শুরু ও শেষ (বাংলাদেশ টাইমজোন অনুযায়ী)
    const { startOfDay, endOfDay } = getBangladeshDayBounds();

    // আজকের ডোজ বের করা
    let todayDoses = profile?.id
      ? await db.dose.findMany({
          where: {
            scheduledAt: {
              gte: startOfDay,
              lte: endOfDay,
            },
            schedule: {
              medicine: {
                patientProfileId: profile.id,
              },
            },
          },
          include: {
            schedule: {
              include: {
                medicine: true,
              },
            },
          },
          orderBy: { scheduledAt: "asc" },
        })
      : [];

    // যদি ওষুধ থাকে কিন্তু আজকের কোনো ডোজ তৈরি না হয়ে থাকে
    if (profile && profile.medicines.length > 0 && todayDoses.length === 0) {
      await generateDosesForDate(new Date());
      todayDoses = await db.dose.findMany({
        where: {
          scheduledAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
          schedule: {
            medicine: {
              patientProfileId: profile.id,
            },
          },
        },
        include: {
          schedule: {
            include: {
              medicine: true,
            },
          },
        },
        orderBy: { scheduledAt: "asc" },
      });
    }

    const totalDoses = todayDoses.length;
    const takenDoses = todayDoses.filter((d) => d.status === "TAKEN" || d.status === "LATE").length;
    const missedDoses = todayDoses.filter((d) => d.status === "MISSED").length;
    const pendingDoses = todayDoses.filter((d) => d.status === "PENDING").length;

    // কেয়ারগিভার লিংক বের করা (যদি থাকে)
    const targetUserId = patient?.id ?? profile?.userId;
    const caregiverLink = targetUserId
      ? await db.caregiverPatient.findFirst({
          where: { patientId: targetUserId },
          include: { caregiver: true },
        })
      : null;

    const caregiverInfo = caregiverLink
      ? {
          name: caregiverLink.caregiver.name,
          phone: caregiverLink.caregiver.phone,
          relation: caregiverLink.relation,
        }
      : null;

    return NextResponse.json({
      success: true,
      patient: {
        id: patient?.id || patientUserId,
        name: patientName,
        phone: patientPhone,
        age: profile?.age ?? null,
      },
      caregiver: caregiverInfo,
      summary: {
        total: totalDoses,
        taken: takenDoses,
        missed: missedDoses,
        pending: pendingDoses,
        adherencePercentage: totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 100,
      },
      todayDoses,
      medicines: profile?.medicines || [],
    });
  } catch (error) {
    console.error("GET /api/patients/[id]/dashboard error:", error);
    return NextResponse.json({ error: "ড্যাশবোর্ড তথ্য লোড করতে ব্যর্থ" }, { status: 500 });
  }
}

