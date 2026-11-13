import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateDosesForDate } from "@/lib/scheduler";
import { getBangladeshDayBounds } from "@/lib/timezone";

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
      include: { schedules: true },
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
        stockCount: stockCount !== undefined ? (stockCount === null ? null : parseInt(stockCount, 10)) : existing.stockCount,
        notes: notes !== undefined ? notes : existing.notes,
      },
    });

    // ২. যদি নতুন শিডিউল পাঠানো হয়
    if (Array.isArray(schedules) && schedules.length > 0) {
      // পুরাতন শিডিউলগুলোর আইডি সংগ্রহ
      const oldScheduleIds = existing.schedules.map((s) => s.id);

      // আজকের দিনে যেসব পেন্ডিং ডোজ আছে সেগুলো ডিলিট করা যাতে নতুন সময়ের সাথে রি-জেনারেট হয়
      const { startOfDay, endOfDay } = getBangladeshDayBounds();
      await db.dose.deleteMany({
        where: {
          scheduleId: { in: oldScheduleIds },
          status: "PENDING",
          scheduledAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

      // পুরাতন সব শিডিউল নিষ্ক্রিয় (বা মুছে) ফেলা
      await db.schedule.deleteMany({
        where: { medicineId },
      });

      // নতুন শিডিউল যোগ করা
      const now = new Date();
      await db.schedule.createMany({
        data: schedules.map((item: { time: string; label?: string }) => ({
          medicineId,
          time: item.time,
          label: item.label || null,
          startDate: now,
          repeatType: "DAILY",
          isActive: true,
        })),
      });

      // আজকের জন্য সাথে সাথে নতুন ডোজগুলো তৈরি করে নেওয়া
      await generateDosesForDate(new Date());
    }

    return NextResponse.json({
      success: true,
      message: "ওষুধ সফলভাবে আপডেট করা হয়েছে",
      medicine: updatedMedicine,
    });
  } catch (error) {
    console.error("PUT /api/medicines/[id] error:", error);
    return NextResponse.json(
      { error: "ওষুধ আপডেট করতে ব্যর্থ" },
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
