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

/**
 * ২৪ ঘণ্টার "HH:mm" ফরম্যাটকে ১২ ঘণ্টার বাংলা সময়ে রূপান্তর করে।
 * উদাহরণ:
 * "08:00" -> "সকাল ৮:০০"
 * "13:00" -> "দুপুর ১:০০"
 * "16:30" -> "বিকাল ৪:৩০"
 * "18:25" -> "সন্ধ্যা ৬:২৫"
 * "20:00" -> "রাত ৮:০০"
 */
export function formatBanglaTime(timeStr: string): string {
  if (!timeStr) return "";
  const [hoursStr, minutesStr] = timeStr.split(":");
  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr || "0", 10);
  if (isNaN(hours)) return timeStr;

  let period = "সকাল";
  if (hours >= 0 && hours < 5) period = "রাত";
  else if (hours >= 5 && hours < 12) period = "সকাল";
  else if (hours >= 12 && hours < 16) period = "দুপুর";
  else if (hours >= 16 && hours < 18) period = "বিকাল";
  else if (hours >= 18 && hours < 20) period = "সন্ধ্যা";
  else period = "রাত";

  const displayHours = hours % 12 === 0 ? 12 : hours % 12;

  const toBn = (n: number | string) => {
    const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
    return n
      .toString()
      .split("")
      .map((d) => bnDigits[parseInt(d, 10)] ?? d)
      .join("");
  };

  const hoursBn = toBn(displayHours);
  const minutesBn = minutes < 10 ? `০${toBn(minutes)}` : toBn(minutes);

  return `${period} ${hoursBn}:${minutesBn}`;
}

/**
 * Speech synthesis / ভয়েস ঘোষণার জন্য সময়কে স্বাভাবিক কথ্য বাংলায় রূপান্তর করে।
 * উদাহরণ:
 * "08:00" -> "সকাল ৮টায়"
 * "19:53" -> "সন্ধ্যা ৭টা বেজে ৫৩ মিনিটে"
 * "12:00" -> "দুপুর ১২টায়"
 * "20:15" -> "রাত ৮টা বেজে ১৫ মিনিটে"
 */
export function formatBanglaVoiceTime(timeStr: string): string {
  if (!timeStr) return "";
  const [hoursStr, minutesStr] = timeStr.split(":");
  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr || "0", 10);
  if (isNaN(hours)) return timeStr;

  let period = "সকাল";
  if (hours >= 0 && hours < 5) period = "রাত";
  else if (hours >= 5 && hours < 12) period = "সকাল";
  else if (hours >= 12 && hours < 16) period = "দুপুর";
  else if (hours >= 16 && hours < 18) period = "বিকাল";
  else if (hours >= 18 && hours < 20) period = "সন্ধ্যা";
  else period = "রাত";

  const displayHours = hours % 12 === 0 ? 12 : hours % 12;

  const toBn = (n: number | string) => {
    const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
    return n
      .toString()
      .split("")
      .map((d) => bnDigits[parseInt(d, 10)] ?? d)
      .join("");
  };

  const hoursBn = toBn(displayHours);
  if (minutes === 0) {
    return `${period} ${hoursBn}টায়`;
  }
  const minutesBn = toBn(minutes);
  return `${period} ${hoursBn}টা বেজে ${minutesBn} মিনিটে`;
}

