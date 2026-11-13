import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { CreateMedicineSchema } from "@/lib/medicine-schema";
import { generateDosesForDate } from "@/lib/scheduler";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const patientProfileId = searchParams.get("patientProfileId");

    const whereClause = patientProfileId ? { patientProfileId, isActive: true } : { isActive: true };

    const medicines = await db.medicine.findMany({
      where: whereClause,
      include: {
        schedules: {
          where: { isActive: true },
        },
        patientProfile: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, medicines });
  } catch (error) {
    console.error("GET /api/medicines error:", error);
    return NextResponse.json({ error: "ওষুধের তালিকা লোড করতে ব্যর্থ" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = CreateMedicineSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const {
      patientProfileId,
      name,
      dose,
      foodTiming,
      stockCount,
      prescriptionUrl,
      notes,
      startDate,
      endDate,
      schedules,
    } = parsed.data;

    // ভেরিফাই করা যে PatientProfile ডাটাবেসে আছে (id অথবা userId উভয় দিয়েই চেক করা)
    let profile = await db.patientProfile.findUnique({
      where: { id: patientProfileId },
    });

    if (!profile) {
      profile = await db.patientProfile.findUnique({
        where: { userId: patientProfileId },
      });
    }

    if (!profile) {
      return NextResponse.json({ error: "রোগীর প্রোফাইল পাওয়া যায়নি" }, { status: 404 });
    }

    const targetProfileId = profile.id;

    const startDateTime = startDate ? new Date(startDate) : new Date();
    const endDateTime = endDate ? new Date(endDate) : null;

    // Medicine ও এর Schedules একই লেনদেনে (Transaction) সেভ করা
    const medicine = await db.medicine.create({
      data: {
        patientProfileId: targetProfileId,
        name,
        dose,
        foodTiming,
        stockCount: stockCount ?? null,
        prescriptionUrl: prescriptionUrl || null,
        notes: notes || null,
        schedules: {
          create: schedules.map((item) => ({
            time: item.time,
            label: item.label || null,
            startDate: startDateTime,
            endDate: endDateTime,
            repeatType: "DAILY",
          })),
        },
      },
      include: {
        schedules: true,
      },
    });

    // ওষুধ যোগ হওয়ার সাথে সাথে আজকের দিনের ডোজগুলো ইনস্ট্যান্টলি জেনারেট করে নেওয়া
    try {
      await generateDosesForDate(new Date());
    } catch (e) {
      console.error("Instant dose generation error:", e);
    }

    return NextResponse.json({
      success: true,
      message: "ওষুধ এবং সময়সূচি সফলভাবে সংরক্ষিত হয়েছে",
      medicine,
    });
  } catch (error) {
    console.error("POST /api/medicines error:", error);
    return NextResponse.json(
      { error: "ওষুধ সংরক্ষণ করতে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}

