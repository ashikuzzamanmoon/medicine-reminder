import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getBangladeshDayBounds, getBangladeshDateTime } from "@/lib/timezone";

// নির্দিষ্ট ওষুধের তথ্য পাওয়া
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const medicineId = params.id;
    const medicine = await db.medicine.findUnique({
      where: { id: medicineId },
      include: {
        schedules: {
          where: { isActive: true },
          orderBy: { time: "asc" },
        },
      },
    });

    if (!medicine) {
      return NextResponse.json(
        { error: "ওষুধ পাওয়া যায়নি" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, medicine });
  } catch (error) {
    console.error("GET /api/medicines/[id] error:", error);
    return NextResponse.json(
      { error: "ওষুধের তথ্য লোড করতে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}

// ওষুধ এডিট বা আপডেট করা
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const medicineId = params.id;
    const body = await req.json();
    const { name, dose, foodTiming, stockCount, notes, schedules } = body;

    const existing = await db.medicine.findUnique({
      where: { id: medicineId },
      include: {
        schedules: {
          where: { isActive: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "ওষুধ পাওয়া যায়নি" },
        { status: 404 }
      );
    }

    // ১. ওষুধের মূল তথ্য আপডেট করা
    const updatedMedicine = await db.medicine.update({
      where: { id: medicineId },
      data: {
        name: name ?? existing.name,
        dose: dose ?? existing.dose,
        foodTiming: foodTiming ?? existing.foodTiming,
        stockCount:
          stockCount !== undefined
            ? stockCount === null
              ? null
              : parseInt(stockCount, 10)
            : existing.stockCount,
        notes: notes !== undefined ? notes : existing.notes,
      },
    });

    // ২. শিডিউল নিরাপদে আপডেট করা (Foreign Key ভায়োলেশন এড়াতে)
    if (Array.isArray(schedules) && schedules.length > 0) {
      const existingSchedules = existing.schedules;
      const { startOfDay, endOfDay } = getBangladeshDayBounds();

      for (let i = 0; i < schedules.length; i++) {
        const item = schedules[i];

        if (i < existingSchedules.length) {
          // বিদ্যমান শিডিউলটি আপডেট করা
          const targetSchedule = existingSchedules[i];
          const timeChanged = targetSchedule.time !== item.time;

          await db.schedule.update({
            where: { id: targetSchedule.id },
            data: {
              time: item.time,
              label: item.label || null,
              isActive: true,
            },
          });

          // যদি সময় পরিবর্তন হয়ে থাকে, তবে আজকের ডোজের সময়ও সাথে সাথে আপডেট করা ও স্ট্যাটাস পেন্ডিং করা
          if (timeChanged) {
            const newScheduledAt = getBangladeshDateTime(new Date(), item.time);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (db as any).dose.updateMany({
              where: {
                scheduleId: targetSchedule.id,
                scheduledAt: { gte: startOfDay, lte: endOfDay },
              },
              data: {
                scheduledAt: newScheduledAt,
                status: "PENDING",
                reminderSentAt: null, // নতুন সময়ের জন্য রিমাইন্ডার পাঠানোর সুযোগ দেওয়া
                confirmedAt: null,
                confirmedBy: null,
              },
            });
          }
        } else {
          // নতুন শিডিউল যোগ করা
          const newSchedule = await db.schedule.create({
            data: {
              medicineId,
              time: item.time,
              label: item.label || null,
              startDate: new Date(),
              repeatType: "DAILY",
              isActive: true,
            },
          });

          // নতুন শিডিউলের জন্য আজকের পেন্ডিং ডোজ তৈরি
          const scheduledAt = getBangladeshDateTime(new Date(), item.time);
          await db.dose.create({
            data: {
              scheduleId: newSchedule.id,
              scheduledAt,
              status: "PENDING",
            },
          });
        }
      }

      // যদি আগের চেয়ে কম সংখ্যক শিডিউল থাকে (ইউজার কোনো শিডিউল রিমুভ করেছেন)
      if (existingSchedules.length > schedules.length) {
        for (let i = schedules.length; i < existingSchedules.length; i++) {
          const removedSchedule = existingSchedules[i];

          // আজকের পেন্ডিং ডোজ মুছে ফেলা
          await db.dose.deleteMany({
            where: {
              scheduleId: removedSchedule.id,
              status: "PENDING",
              scheduledAt: { gte: startOfDay, lte: endOfDay },
            },
          });

          // শিডিউলটি ইনঅ্যাক্টিভ করা যাতে কোনো হিস্ট্রি ক্ষতিগ্রস্ত না হয়
          await db.schedule.update({
            where: { id: removedSchedule.id },
            data: { isActive: false },
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "ওষুধ সফলভাবে আপডেট করা হয়েছে",
      medicine: updatedMedicine,
    });
  } catch (error) {
    console.error("PUT /api/medicines/[id] error:", error);
    return NextResponse.json(
      {
        error: "ওষুধ আপডেট করতে ব্যর্থ",
        details: error instanceof Error ? error.message : "অজানা সমস্যা",
      },
      { status: 500 }
    );
  }
}

// ওষুধ মুছে ফেলা বা নিষ্ক্রিয় করা
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const medicineId = params.id;

    // সংশ্লিষ্ট পেন্ডিং ডোজ ডিলিট
    const schedules = await db.schedule.findMany({
      where: { medicineId },
    });
    const scheduleIds = schedules.map((s) => s.id);

    await db.dose.deleteMany({
      where: {
        scheduleId: { in: scheduleIds },
        status: "PENDING",
      },
    });

    // ওষুধ ইনঅ্যাক্টিভ করা
    await db.medicine.update({
      where: { id: medicineId },
      data: { isActive: false },
    });

    await db.schedule.updateMany({
      where: { medicineId },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      message: "ওষুধ সফলভাবে মুছে ফেলা হয়েছে",
    });
  } catch (error) {
    console.error("DELETE /api/medicines/[id] error:", error);
    return NextResponse.json(
      { error: "ওষুধ মুছতে ব্যর্থ" },
      { status: 500 }
    );
  }
}
