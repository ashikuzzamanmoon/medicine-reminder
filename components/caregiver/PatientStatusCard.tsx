"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface PatientDashboardData {
  patient: {
    id: string;
    name: string;
    phone: string | null;
    age: number | null;
  };
  summary: {
    total: number;
    taken: number;
    missed: number;
    pending: number;
    adherencePercentage: number;
  };
  todayDoses: {
    id: string;
    scheduledAt: string;
    status: string;
    schedule: {
      time: string;
      label: string | null;
      medicine: {
        id: string;
        name: string;
        dose: string;
        foodTiming: string;
        stockCount: number | null;
      };
    };
  }[];
  medicines: {
    id: string;
    name: string;
    dose: string;
    stockCount: number | null;
  }[];
}

export default function PatientStatusCard({ patientId, relation }: { patientId: string; relation: string }) {
  const [data, setData] = useState<PatientDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const res = await fetch(`/api/patients/${patientId}/dashboard`);
      const result = await res.json();
      if (result.success) {
        setData(result);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleMarkAsTaken = async (doseId: string) => {
    setActionLoading(doseId);
    try {
      await fetch(`/api/doses/${doseId}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "TAKEN", confirmedBy: "CAREGIVER" }),
      });
      loadData();
    } catch (err) {
      console.error("Mark as taken error:", err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <div className="p-6 bg-white rounded-3xl border border-gray-100 animate-pulse h-64"></div>;
  }

  if (!data) return null;

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-2xl font-bold text-gray-900">{data.patient.name}</h3>
            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">
              {relation}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            {data.patient.age ? `বয়স: ${data.patient.age} বছর` : ""}
            {data.patient.phone ? ` • ${data.patient.phone}` : ""}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {data.patient.phone && (
            <a
              href={`tel:${data.patient.phone}`}
              className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold rounded-xl text-sm flex items-center gap-1.5 transition-colors"
            >
              📞 কল করুন
            </a>
          )}
          <Link
            href="/medicines/new"
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-sm flex items-center gap-1 transition-colors"
          >
            + ওষুধ যোগ
          </Link>
        </div>
      </div>

      {/* Progress & Stat Cards */}
      <div className="p-6 border-b border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-gray-50 rounded-2xl text-center">
          <p className="text-xs text-gray-500 font-medium">আজকের ডোজ</p>
          <p className="text-2xl font-black text-gray-800 mt-1">{data.summary.total}টি</p>
        </div>
        <div className="p-4 bg-green-50 rounded-2xl text-center">
          <p className="text-xs text-green-700 font-medium">খেয়েছেন ✅</p>
          <p className="text-2xl font-black text-green-800 mt-1">{data.summary.taken}টি</p>
        </div>
        <div className="p-4 bg-amber-50 rounded-2xl text-center">
          <p className="text-xs text-amber-700 font-medium">বাকি আছে ⏳</p>
          <p className="text-2xl font-black text-amber-800 mt-1">{data.summary.pending}টি</p>
        </div>
        <div className="p-4 bg-purple-50 rounded-2xl text-center">
          <p className="text-xs text-purple-700 font-medium">নিয়মিত হার</p>
          <p className="text-2xl font-black text-purple-800 mt-1">{data.summary.adherencePercentage}%</p>
        </div>
      </div>

      {/* Today's Doses Schedule List */}
      <div className="p-6">
        <h4 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span>🕒 আজকের ওষুধের তালিকা</span>
        </h4>

        {data.todayDoses.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-2xl">
            আজকের জন্য কোনো ডোজ নির্ধারিত নেই।
          </div>
        ) : (
          <div className="space-y-3">
            {data.todayDoses.map((dose) => (
              <div
                key={dose.id}
                className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors bg-white shadow-sm"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 text-lg">{dose.schedule.medicine.name}</span>
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md font-medium">
                      {dose.schedule.medicine.dose}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    সময়: {dose.schedule.time} {dose.schedule.label ? `(${dose.schedule.label})` : ""}
                    {dose.schedule.medicine.stockCount !== null && (
                      <span className={`ml-2 font-semibold ${dose.schedule.medicine.stockCount <= 5 ? "text-red-500" : "text-gray-500"}`}>
                        স্টক: {dose.schedule.medicine.stockCount}টি
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/reminder?doseId=${dose.id}`}
                    target="_blank"
                    className="px-2.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
                    title="রোগীর জন্য বড় বোতাম ও ভয়েস স্ক্রিন দেখুন"
                  >
                    রোগীর স্ক্রিন 📱
                  </Link>
                  {dose.status === "TAKEN" || dose.status === "LATE" ? (
                    <span className="px-3 py-1.5 bg-green-100 text-green-800 font-bold text-xs rounded-xl flex items-center gap-1">
                      ✅ খাওয়া হয়েছে
                    </span>
                  ) : (
                    <button
                      onClick={() => handleMarkAsTaken(dose.id)}
                      disabled={actionLoading === dose.id}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm disabled:opacity-50"
                    >
                      {actionLoading === dose.id ? "আপডেট হচ্ছে..." : "খেয়েছে মার্ক করুন"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

