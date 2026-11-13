/**
 * বাংলাদেশ টাইমজোন (Asia/Dhaka, UTC+6) ইউটিলিটি
 * Vercel সার্ভার ডিফল্টভাবে UTC তে চলে, তাই বাংলাদেশের সময় সঠিকভাবে মেইনটেইন করার জন্য এই ফাংশনগুলো ব্যবহার করা হয়।
 */

export const BD_TIMEZONE = "Asia/Dhaka";

/**
 * যেকোনো তারিখের জন্য বাংলাদেশে বর্তমান YYYY-MM-DD ফরম্যাট রিটার্ন করে
 */
export function getBangladeshDateString(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BD_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/**
 * বাংলাদেশ ক্যালেন্ডারের একটি দিনের শুরু (00:00:00) ও শেষ (23:59:59.999) বের করে
 */
export function getBangladeshDayBounds(targetDate: Date = new Date()): {
  startOfDay: Date;
  endOfDay: Date;
} {
  const dateStr = getBangladeshDateString(targetDate);
  const startOfDay = new Date(`${dateStr}T00:00:00+06:00`);
  const endOfDay = new Date(`${dateStr}T23:59:59.999+06:00`);

  return { startOfDay, endOfDay };
}

/**
 * একটি নির্দিষ্ট তারিখ এবং "HH:mm" সময়ের জন্য বাংলাদেশ সময় অনুযায়ী সঠিক Date অবজেক্ট তৈরি করে।
 * উদাহরণ: timeStr = "18:25" হলে এটি 18:25 (+06:00) অর্থাৎ 12:25 UTC তৈরি করবে।
 */
export function getBangladeshDateTime(
  date: Date | string = new Date(),
  timeStr: string
): Date {
  const d = typeof date === "string" ? new Date(date) : date;
  const dateStr = getBangladeshDateString(d);

  const [hoursStr, minutesStr] = timeStr.split(":");
  const hours = (hoursStr || "00").padStart(2, "0");
  const minutes = (minutesStr || "00").padStart(2, "0");

  return new Date(`${dateStr}T${hours}:${minutes}:00+06:00`);
}
