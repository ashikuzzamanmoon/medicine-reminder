import { z } from "zod";

export const ScheduleItemSchema = z.object({
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "সময় HH:mm ফরম্যাটে দিন (যেমন: 08:00, 21:00)"),
  label: z.string().optional(), // যেমন: "সকাল", "দুপুর", "রাত"
});

export const CreateMedicineSchema = z.object({
  patientProfileId: z.string().min(1, "রোগী নির্বাচন করুন"),
  name: z.string().min(2, "ওষুধের নাম লিখুন").max(100),
  dose: z.string().min(1, "ডোজ উল্লেখ করুন (যেমন: ১টি ট্যাবলেট, ৫ মিলি)").max(50),
  foodTiming: z.enum(["BEFORE", "AFTER", "ANY"]).default("AFTER"),
  stockCount: z.coerce.number().int().min(0, "স্টক সংখ্যা ঋণাত্মক হতে পারে না").optional(),
  prescriptionUrl: z.string().url().optional().or(z.literal("")),
  notes: z.string().max(500).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional().or(z.literal("")),
  schedules: z.array(ScheduleItemSchema).min(1, "কমপক্ষে একটি সময়সূচি যোগ করুন"),
});

export type CreateMedicineInput = z.infer<typeof CreateMedicineSchema>;

