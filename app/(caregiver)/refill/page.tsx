"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface RefillMedicine {
  id: string;
  name: string;
  dose: string;
  stockCount: number | null;
  patientName: string;
  daysRemaining: number;
}

interface Pharmacy {
  id: string;
  name: string;
  address: string;
  area: string;
  phone: string;
  whatsapp: string | null;
}

interface ApiMedicineItem {
  id: string;
  name: string;
  dose: string;
  stockCount: number | null;
  patientProfile?: { name?: string };
  schedules?: { id: string }[];
}

export default function RefillPage() {
  const [medicines, setMedicines] = useState<RefillMedicine[]>([]);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [medRes, pharmRes] = await Promise.all([
          fetch("/api/medicines"),
          fetch("/api/pharmacies"),
        ]);
        const medData = await medRes.json();
        const pharmData = await pharmRes.json();

        if (medData.medicines) {
          const mapped = medData.medicines.map((m: ApiMedicineItem) => {
            const daily = m.schedules?.length || 1;
            const stock = m.stockCount ?? 0;
            return {
              id: m.id,
              name: m.name,
              dose: m.dose,
              stockCount: m.stockCount,
              patientName: m.patientProfile?.name || "পরিবারের সদস্য",
              daysRemaining: Math.floor(stock / daily),
            };
          });
          setMedicines(mapped);
        }

        if (pharmData.pharmacies) {
          setPharmacies(pharmData.pharmacies);
        }
      } catch (err) {
        console.error("Refill data load failed:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getWhatsAppLink = (pharmacyNumber: string, medicineName: string, dose: string) => {
    const cleanNumber = pharmacyNumber.replace(/[^0-9]/g, "");
    const msg = encodeURIComponent(
      `আসসালামু আলাইকুম। আমার নিম্নলিখিত ওষুধটি রিফিল প্রয়োজন:\n- ওষুধের নাম: ${medicineName}\n- ডোজ: ${dose}\nঅনুগ্রহ করে ডেলিভারির ব্যবস্থা করবেন কি?`
    );
    return `https://wa.me/${cleanNumber}?text=${msg}`;
  };

  return (
    <div className="min-h-screen bg-gray-50/70 pb-16">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="text-sm font-semibold text-green-700 hover:underline">
            ← ড্যাশবোর্ডে ফিরে যান
          </Link>
          <span className="text-lg font-bold text-gray-900">ওষুধের স্টক ও রিফিল</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-8 space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">ওষুধের স্টক ট্র্যাকিং</h1>
          <p className="text-sm text-gray-500 mt-1">
            কোন ওষুধ কতদিনের আছে দেখে নিন এবং সরাসরি WhatsApp-এ স্থানীয় ফার্মেসি থেকে অর্ডার করুন
          </p>
        </div>

        {loading ? (
          <div className="p-8 bg-white rounded-3xl border border-gray-100 animate-pulse h-48"></div>
        ) : (
          <>
            {/* Low Stock Alerts Banner */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {medicines.map((med) => {
                const isLow = med.daysRemaining <= 5;
                const defaultPharmacy = pharmacies[0];
                return (
                  <div
                    key={med.id}
                    className={`p-6 rounded-3xl border transition-all ${
                      isLow
                        ? "bg-red-50/80 border-red-200 shadow-sm"
                        : "bg-white border-gray-100 shadow-sm"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-xs font-bold text-gray-500">{med.patientName}</span>
                        <h3 className="text-xl font-bold text-gray-900">{med.name}</h3>
                        <p className="text-sm text-gray-600 mt-0.5">ডোজ: {med.dose}</p>
                      </div>
                      <span
                        className={`px-3 py-1 text-xs font-black rounded-full ${
                          isLow
                            ? "bg-red-600 text-white animate-pulse"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {med.daysRemaining} দিনের মজুদ
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200/60 mt-4">
                      <span className="text-sm font-medium text-gray-600">
                        অবশিষ্ট ট্যাবলেট: <strong className="text-gray-900">{med.stockCount ?? 0}টি</strong>
                      </span>

                      {defaultPharmacy?.whatsapp && (
                        <a
                          href={getWhatsAppLink(defaultPharmacy.whatsapp, med.name, med.dose)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
                        >
                          <span>💬</span> WhatsApp অর্ডার
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pharmacies List */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>🏥 নিকটস্থ ফার্মেসি তালিকা</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {pharmacies.map((pharm) => (
                  <div key={pharm.id} className="p-4 rounded-2xl border border-gray-100 bg-gray-50 flex flex-col justify-between">
                    <div>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md font-bold">
                        {pharm.area}
                      </span>
                      <h4 className="font-bold text-gray-900 mt-2">{pharm.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">{pharm.address}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-200">
                      <a
                        href={`tel:${pharm.phone}`}
                        className="flex-1 py-1.5 text-center text-xs font-bold text-gray-700 bg-white rounded-lg border border-gray-300 hover:bg-gray-100"
                      >
                        📞 কল করুন
                      </a>
                      {pharm.whatsapp && (
                        <a
                          href={`https://wa.me/${pharm.whatsapp}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-1.5 text-center text-xs font-bold text-emerald-700 bg-emerald-50 rounded-lg border border-emerald-200 hover:bg-emerald-100"
                        >
                          WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
