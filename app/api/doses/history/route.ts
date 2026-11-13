import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const patientUserId = searchParams.get("patientUserId");
    const days = parseInt(searchParams.get("days") || "7", 10);

    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);
    fromDate.setHours(0, 0, 0, 0);

    const whereClause: Prisma.DoseWhereInput = {
      scheduledAt: { gte: fromDate },
    };

    if (patientUserId) {
      whereClause.schedule = {
        medicine: {
          patientProfile: {
            userId: patientUserId,
          },
        },
      };
    }

    const doses = await db.dose.findMany({
      where: whereClause,
      include: {
        schedule: {
          include: {
            medicine: true,
          },
        },
      },
      orderBy: { scheduledAt: "desc" },
    });

    const totalDoses = doses.length;
    const takenDoses = doses.filter((d) => d.status === "TAKEN" || d.status === "LATE").length;
    const missedDoses = doses.filter((d) => d.status === "MISSED").length;
    const skippedDoses = doses.filter((d) => d.status === "SKIPPED").length;

    const adherenceRate = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 100;

    return NextResponse.json({
      success: true,
      timeframeDays: days,
      summary: {
        total: totalDoses,
        taken: takenDoses,
        missed: missedDoses,
        skipped: skippedDoses,
        adherenceRate,
      },
      doses,
    });
  } catch (error) {
    console.error("GET /api/doses/history error:", error);
    return NextResponse.json(
      { error: "ওষুধের ইতিহাস লোড করতে ব্যর্থ" },
      { status: 500 }
    );
  }
}
