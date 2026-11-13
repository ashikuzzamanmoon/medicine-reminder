import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { z } from "zod";

const ModeSchema = z.object({
  mode: z.enum(["SELF", "FAMILY"]),
  selfPatientName: z.string().optional(),
  selfPatientAge: z.number().optional(),
});

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get("authjs.session-token")?.value;

    let user = null;
    if (sessionToken) {
      const session = await db.session.findUnique({
        where: { sessionToken },
        include: { user: true },
      });
      user = session?.user;
    } else {
      user = await db.user.findFirst();
    }

    if (!user) {
      return NextResponse.json({ error: "লগইন প্রয়োজন" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = ModeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { mode, selfPatientAge } = parsed.data;

    // ইউজার মোড আপডেট
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: { mode },
    });

    // Self Mode হলে ইউজারের নিজের জন্য PatientProfile ও CaregiverPatient লিংক তৈরি করা
    if (mode === "SELF") {
      let profile = await db.patientProfile.findUnique({
        where: { userId: user.id },
      });

      if (!profile) {
        profile = await db.patientProfile.create({
          data: {
            userId: user.id,
            age: selfPatientAge || null,
          },
        });

        await db.caregiverPatient.upsert({
          where: {
            caregiverId_patientId: {
              caregiverId: user.id,
              patientId: user.id,
            },
          },
          update: {},
          create: {
            caregiverId: user.id,
            patientId: user.id,
            relation: "নিজে",
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: mode === "SELF" ? "Self Mode সক্রিয় হয়েছে" : "Family Mode সক্রিয় হয়েছে",
      user: updatedUser,
    });
  } catch (error) {
    console.error("POST /api/user/mode error:", error);
    return NextResponse.json({ error: "মোড সেভ করতে ব্যর্থ" }, { status: 500 });
  }
}
