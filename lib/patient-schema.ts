import { z } from "zod";

// Create Patient Profile Schema
export const CreatePatientProfileSchema = z.object({
  name: z.string().min(2, "রোগীর নাম কমপক্ষে ২ অক্ষরের হতে হবে").max(100),
  age: z.coerce.number().int().min(1, "সঠিক বয়স দিন").max(120, "বয়স ১২০ এর বেশি হতে পারে না").optional(),
  relation: z.string().min(2, "সম্পর্ক উল্লেখ করুন (যেমন: বাবা, মা, স্ত্রী)").max(50),
  phone: z.string().regex(/^(?:\+8801|01)[3-9]\d{8}$/, "সঠিক ফোন নম্বর দিন").optional().or(z.literal("")),
  image: z.string().url("সঠিক ইমেজ লিঙ্ক দিন").optional().or(z.literal("")),
});

export type CreatePatientProfileInput = z.infer<typeof CreatePatientProfileSchema>;
