import { z } from "zod";

// Phone number validation: Bangladeshi phone format (e.g. 017xxxxxxxx or +88017xxxxxxxx)
export const PhoneSchema = z.string().regex(/^(?:\+8801|01)[3-9]\d{8}$/, {
  message: "সঠিক বাংলাদেশি ফোন নম্বর দিন (যেমন: 017xxxxxxxx)",
});

export const SendOtpSchema = z.object({
  phone: PhoneSchema,
});

export const VerifyOtpSchema = z.object({
  phone: PhoneSchema,
  otp: z.string().length(6, { message: "OTP ৬ সংখ্যার হতে হবে" }),
  name: z.string().min(2, { message: "নাম কমপক্ষে ২ অক্ষরের হতে হবে" }).optional(),
});

