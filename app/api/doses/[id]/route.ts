import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const dose = await db.dose.findUnique({
      where: { id: params.id },
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

    if (!dose) {
      return NextResponse.json({ error: "ডোজ পাওয়া যায়নি" }, { status: 404 });
    }

    return NextResponse.json({ success: true, dose });
  } catch (error) {
    console.error("GET /api/doses/[id] error:", error);
    return NextResponse.json({ error: "ডোজ লোড করতে ব্যর্থ" }, { status: 500 });
  }
}
