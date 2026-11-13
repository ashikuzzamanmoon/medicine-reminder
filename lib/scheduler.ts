import { db } from "@/lib/db";

/**
 * নির্দিষ্ট একটি দিনের জন্য (ডিফল্ট: আজকের দিন) সব একটিভ Schedule থেকে
 * প্রয়োজনীয় Dose রো তৈরি করে (যদি ইতিমধ্যে তৈরি না হয়ে থাকে)।
 */
export async function generateDosesForDate(targetDate: Date = new Date()) {
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  // ১. সকল একটিভ শিডিউল আনা যার মেয়াদ এখনও আছে এবং ওষুধের স্ট্যাটাস একটিভ
  const activeSchedules = await db.schedule.findMany({
    where: {
      isActive: true,
      medicine: {
        isActive: true,
      },
      startDate: {
        lte: endOfDay,
      },
      OR: [
        { endDate: null },
        { endDate: { gte: startOfDay } },
      ],
    },
    include: {
      medicine: {
        include: {
          patientProfile: true,
        },
      },
    },
  });

  const createdDoses = [];

  for (const schedule of activeSchedules) {
    // schedule.time ফরম্যাট "HH:mm"
    const [hoursStr, minutesStr] = schedule.time.split(":");
    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);

    const scheduledAt = new Date(targetDate);
    scheduledAt.setHours(hours, minutes, 0, 0);

    // ২. ডুপ্লিকেট চেক: আজকের এই শিডিউলের ডোজ কি ইতিমধ্যে ডাটাবেসে আছে?
    const existingDose = await db.dose.findFirst({
      where: {
        scheduleId: schedule.id,
        scheduledAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (!existingDose) {
      const newDose = await db.dose.create({
        data: {
          scheduleId: schedule.id,
          scheduledAt,
          status: "PENDING",
        },
      });
      createdDoses.push(newDose);
    }
  }

  return {
    totalActiveSchedules: activeSchedules.length,
    newDosesCreated: createdDoses.length,
  };
}

