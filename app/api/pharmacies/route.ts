import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const area = searchParams.get("area");

    const whereClause = area
      ? { isActive: true, area: { contains: area, mode: "insensitive" as const } }
      : { isActive: true };

    let pharmacies = await db.pharmacy.findMany({
      where: whereClause,
      orderBy: { name: "asc" },
    });

    // ডাটাবেস খালি থাকলে ডিফল্ট নির্ভরযোগ্য কিছু বাংলাদেশি ফার্মেসি সিড করা
    if (pharmacies.length === 0) {
      const defaultPharmacies = [
        {
          name: "লাজ ফার্মা (মিরপুর শাখা)",
          address: "প্লট #২, রোড #১, মিরপুর-১০, ঢাকা",
          area: "মিরপুর",
          phone: "01711002233",
          whatsapp: "8801711002233",
        },
        {
          name: "তামান্না ফার্মেসি (ধানমণ্ডি)",
          address: "রোড #২৭ (পুরাতন), ধানমণ্ডি, ঢাকা",
          area: "ধানমণ্ডি",
          phone: "01811445566",
          whatsapp: "8801811445566",
        },
        {
          name: "প্রেসক্রিপশন পয়েন্ট ফার্মেসি",
          address: "বাড়ি #১, রোড #২, গুলশান-১, ঢাকা",
          area: "গুলশান",
          phone: "01911778899",
          whatsapp: "8801911778899",
        },
      ];

      for (const p of defaultPharmacies) {
        await db.pharmacy.create({ data: p });
      }

      pharmacies = await db.pharmacy.findMany({
        where: { isActive: true },
      });
    }

    return NextResponse.json({ success: true, pharmacies });
  } catch (error) {
    console.error("GET /api/pharmacies error:", error);
    return NextResponse.json({ error: "ফার্মেসির তালিকা লোড করতে ব্যর্থ" }, { status: 500 });
  }
}
