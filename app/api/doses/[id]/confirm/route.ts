import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const ConfirmActionSchema = z.object({
  status: z.enum(["TAKEN", "SKIPPED", "SNOOZE"]),
  skippedReason: z.string().max(200).optional(),
  confirmedBy: z.string().optional(),
});

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const doseId = params.id;
    const body = await req.json();
    const parsed = ConfirmActionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { status, skippedReason, confirmedBy } = parsed.data;

    const existingDose = await db.dose.findUnique({
      where: { id: doseId },
      include: {
        schedule: {
          include: {
            medicine: true,
          },
        },
      },
    });

    if (!existingDose) {
      return NextResponse.json({ error: "ডোজ পাওয়া যায়নি" }, { status: 404 });
    }

    // ১. "পরে খাবো" (SNOOZE) চাপলে: নির্ধারিত সময় ৩০ মিনিট বাড়িয়ে দেওয়া হবে
    if (status === "SNOOZE") {
      const snoozedTime = new Date(Date.now() + 30 * 60 * 1000);
      const updatedDose = await db.dose.update({
        where: { id: doseId },
        data: {
          scheduledAt: snoozedTime,
          status: "PENDING",
        },
      });

      return NextResponse.json({
        success: true,
        message: "৩০ মিনিট পরে আপনাকে আবার মনে করিয়ে দেওয়া হবে",
        dose: updatedDose,
      });
    }

    // ২. "খেয়েছি" (TAKEN) অথবা "খাইনি" (SKIPPED)
    const confirmedAt = new Date();
    const isLate = confirmedAt.getTime() - existingDose.scheduledAt.getTime() > 45 * 60 * 1000;
    const finalStatus = status === "TAKEN" ? (isLate ? "LATE" : "TAKEN") : "SKIPPED";

    // ডোজ স্ট্যাটাস আপডেট
    const updatedDose = await db.dose.update({
      where: { id: doseId },
      data: {
        status: finalStatus,
        confirmedAt,
        confirmedBy: confirmedBy || "PATIENT",
        skippedReason: skippedReason || null,
      },
    });

    // ওষুধ খাওয়ার ফলে স্টক ১ কমানো (যদি স্টক কাউন্ট দেওয়া থাকে)
    if (status === "TAKEN" && existingDose.schedule.medicine.stockCount !== null) {
      const currentStock = existingDose.schedule.medicine.stockCount;
      if (currentStock > 0) {
        await db.medicine.update({
          where: { id: existingDose.schedule.medicineId },
          data: {
            stockCount: currentStock - 1,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: status === "TAKEN" ? "ওষুধ খাওয়া সম্পন্ন হয়েছে! ধন্যবাদ।" : "রেকর্ড রাখা হয়েছে।",
      dose: updatedDose,
    });
  } catch (error) {
    console.error("POST /api/doses/[id]/confirm error:", error);
    return NextResponse.json(
      { error: "ডোজ নিশ্চিত করতে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}

