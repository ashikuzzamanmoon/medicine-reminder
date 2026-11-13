import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { CreatePatientProfileSchema } from "@/lib/patient-schema";
import { cookies } from "next/headers";

// বর্তমান সেশন ইউজার পাওয়ার জন্য হেলপার
async function getCurrentUser() {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get("authjs.session-token")?.value;

  if (!sessionToken) {
    // Dev মোডে যদি লগইন ছাড়া টেস্ট করতে চায়, প্রথম ইউজার নেওয়া হবে
    const firstUser = await db.user.findFirst();
    return firstUser;
  }

  const session = await db.session.findUnique({
    where: { sessionToken },
    include: { user: true },
  });

  return session?.user ?? null;
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "লগইন করা প্রয়োজন" }, { status: 401 });
    }

    const currentUser = {
      id: user.id,
      name: user.name,
      role: user.role,
      mode: user.mode,
      phone: user.phone,
    };

    // যদি ব্যবহারকারী নিজেই রোগী হন (PATIENT রোল)
    if (user.role === "PATIENT") {
      const myProfile = await db.patientProfile.findUnique({
        where: { userId: user.id },
      });

      return NextResponse.json({
        success: true,
        currentUser,
        isPatient: true,
        patientId: user.id,
        patientProfileId: myProfile?.id || null,
        name: user.name,
        patients: [],
      });
    }

    // কেয়ারগিভারের সব রোগীকে বের করা
    const links = await db.caregiverPatient.findMany({
      where: { caregiverId: user.id },
      include: {
        patient: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // যদি কেয়ারগিভার হিসেবে কোনো লিংক না থাকে, কিন্তু ইউজার নিজেই একজন রোগী হন
    if (links.length === 0) {
      const myProfile = await db.patientProfile.findUnique({
        where: { userId: user.id },
        include: {
          medicines: {
            where: { isActive: true },
          },
        },
      });

      if (myProfile) {
        return NextResponse.json({
          success: true,
          patients: [
            {
              id: user.id,
              profileId: myProfile.id,
              name: user.name,
              phone: user.phone,
              relation: "আমি নিজে",
              age: myProfile.age ?? null,
              image: myProfile.image ?? null,
              medicinesCount: myProfile.medicines.length,
            },
          ],
        });
      }
    }

    // সব প্রোফাইল একবারেই ব্যাচ কোয়েরিতে নিয়ে আসা
    const patientIds = links.map((l) => l.patientId);
    const profiles = await db.patientProfile.findMany({
      where: { userId: { in: patientIds } },
      include: {
        medicines: {
          where: { isActive: true },
        },
      },
    });

    const profileMap = new Map(profiles.map((p) => [p.userId, p]));

    const patients = links.map((link) => {
      const profile = profileMap.get(link.patientId);
      return {
        id: link.patient.id,
        profileId: profile?.id ?? link.patient.id,
        name: link.patient.name,
        phone: link.patient.phone,
        relation: link.relation,
        age: profile?.age ?? null,
        image: profile?.image ?? null,
        medicinesCount: profile?.medicines.length ?? 0,
      };
    });

    return NextResponse.json({
      success: true,
      currentUser,
      isPatient: false,
      patients,
    });
  } catch (error) {
    console.error("GET /api/patients error:", error);
    return NextResponse.json({ error: "রোগীদের তালিকা লোড করতে ব্যর্থ" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "লগইন করা প্রয়োজন" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = CreatePatientProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, age, relation, phone, image } = parsed.data;

    // যদি ব্যবহারকারী নিজের প্রোফাইল তৈরি করতে চান অথবা ফোন নম্বর একই হয়
    let patientUser;
    if (phone && user.phone && phone === user.phone) {
      patientUser = user;
    } else {
      patientUser = await db.user.create({
        data: {
          name,
          phone: phone || null,
          role: "PATIENT",
          mode: "FAMILY",
        },
      });
    }

    // PatientProfile তৈরি বা বের করা
    let profile = await db.patientProfile.findUnique({
      where: { userId: patientUser.id },
    });

    if (!profile) {
      profile = await db.patientProfile.create({
        data: {
          userId: patientUser.id,
          age: age ?? null,
          image: image || null,
        },
      });
    }

    // কেয়ারগিভার ও রোগীর মাঝে সম্পর্ক তৈরি (CaregiverPatient)
    const existingLink = await db.caregiverPatient.findFirst({
      where: {
        caregiverId: user.id,
        patientId: patientUser.id,
      },
    });

    if (!existingLink) {
      await db.caregiverPatient.create({
        data: {
          caregiverId: user.id,
          patientId: patientUser.id,
          relation,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "রোগীর প্রোফাইল সফলভাবে তৈরি হয়েছে",
      patient: {
        id: patientUser.id,
        profileId: profile.id,
        name: patientUser.name,
        relation,
        age: profile.age,
      },
    });
  } catch (error) {
    console.error("POST /api/patients error:", error);
    return NextResponse.json(
      { error: "রোগীর প্রোফাইল তৈরি করতে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}

