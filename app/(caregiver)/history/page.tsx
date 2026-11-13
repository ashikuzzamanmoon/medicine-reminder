"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface HistoryDose {
  id: string;
  scheduledAt: string;
  status: string;
  confirmedAt: string | null;
  confirmedBy: string | null;
  schedule: {
    time: string;
    label: string | null;
    medicine: {
      name: string;
      dose: string;
    };
  };
}

export default function HistoryPage() {
  const [doses, setDoses] = useState<HistoryDose[]>([]);
  const [summary, setSummary] = useState({
    total: 0,
    taken: 0,
    missed: 0,
    skipped: 0,
    adherenceRate: 100,
  });
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/doses/history?days=${days}`);
      const data = await res.json();
      if (data.success) {
        setDoses(data.doses);
        setSummary(data.summary);
      }
    } catch (err) {
      console.error("History fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "TAKEN":
        return <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">✅ খাওয়া হয়েছে</span>;
      case "LATE":
        return <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">⏰ দেরিতে খেয়েছে</span>;
      case "MISSED":
        return <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full">❌ মিস হয়েছে</span>;
      case "SKIPPED":
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">🚫 বাদ দেওয়া</span>;
      default:
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">⏳ পেন্ডিং</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/70 pb-16">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="text-sm font-semibold text-green-700 hover:underline">
            ← ড্যাশবোর্ডে ফিরে যান
          </Link>
          <span className="text-lg font-bold text-gray-900">ওষুধের ইতিহাস ও রিপোর্ট</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-8 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">মেডিসিন হিস্ট্রি ও রিপোর্ট</h1>
            <p className="text-sm text-gray-500 mt-1">গত কয়েকদিনের আনুগত্য হার ও ডোজ খাওয়ার রেকর্ড</p>
          </div>

          <div className="flex gap-2 bg-white p-1 rounded-2xl border border-gray-200 shadow-sm">
            <button
              onClick={() => setDays(7)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                days === 7 ? "bg-green-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              গত ৭ দিন
            </button>
            <button
              onClick={() => setDays(30)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                days === 30 ? "bg-green-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              গত ৩০ দিন
            </button>
          </div>
        </div>

        {/* Analytics Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm text-center">
            <p className="text-xs font-semibold text-gray-500">মোট নির্ধারিত ডোজ</p>
            <p className="text-3xl font-black text-gray-900 mt-2">{summary.total}টি</p>
          </div>
          <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm text-center">
            <p className="text-xs font-semibold text-green-700">সফলভাবে খেয়েছে</p>
            <p className="text-3xl font-black text-green-800 mt-2">{summary.taken}টি</p>
          </div>
          <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm text-center">
            <p className="text-xs font-semibold text-red-600">মিসড ডোজ</p>
            <p className="text-3xl font-black text-red-700 mt-2">{summary.missed}টি</p>
          </div>
          <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm text-center">
            <p className="text-xs font-semibold text-purple-700">আনুগত্য (Adherence)</p>
            <p className="text-3xl font-black text-purple-800 mt-2">{summary.adherenceRate}%</p>
          </div>
        </div>

        {/* History Table */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">বিস্তারিত রেকর্ড</h2>
          {loading ? (
            <div className="py-12 text-center text-gray-400">ইতিহাস লোড হচ্ছে...</div>
          ) : doses.length === 0 ? (
            <div className="py-12 text-center text-gray-500">কোনো হিস্ট্রি রেকর্ড পাওয়া যায়নি।</div>
          ) : (
            <div className="space-y-3">
              {doses.map((dose) => (
                <div
                  key={dose.id}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-2xl bg-gray-50/70 border border-gray-100 gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">{dose.schedule.medicine.name}</span>
                      <span className="text-xs bg-white border border-gray-200 px-2 py-0.5 rounded-md text-gray-600 font-semibold">
                        {dose.schedule.medicine.dose}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      নির্ধারিত সময়: {new Date(dose.scheduledAt).toLocaleDateString("bn-BD")} • {dose.schedule.time}
                      {dose.confirmedAt && (
                        <span className="ml-2 text-gray-600">
                          (খাওয়ার সময়: {new Date(dose.confirmedAt).toLocaleTimeString("bn-BD")})
                        </span>
                      )}
                    </p>
                  </div>
                  <div>{getStatusBadge(dose.status)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

