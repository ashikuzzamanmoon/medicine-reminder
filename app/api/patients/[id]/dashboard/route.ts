import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const patientUserId = params.id;

    const patient = await db.user.findUnique({
      where: { id: patientUserId },
      include: {
        // PatientProfile
      },
    });

    if (!patient) {
      return NextResponse.json({ error: "রোগী পাওয়া যায়নি" }, { status: 404 });
    }

    const profile = await db.patientProfile.findUnique({
      where: { userId: patientUserId },
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
    });

    // আজকের দিনের শুরু ও শেষ
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // আজকের সব ডোজ বের করা
    const todayDoses = await db.dose.findMany({
      where: {
        scheduledAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        schedule: {
          medicine: {
            patientProfileId: profile?.id,
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

    const totalDoses = todayDoses.length;
    const takenDoses = todayDoses.filter((d) => d.status === "TAKEN" || d.status === "LATE").length;
    const missedDoses = todayDoses.filter((d) => d.status === "MISSED").length;
    const pendingDoses = todayDoses.filter((d) => d.status === "PENDING").length;

    return NextResponse.json({
      success: true,
      patient: {
        id: patient.id,
        name: patient.name,
        phone: patient.phone,
        age: profile?.age,
      },
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
