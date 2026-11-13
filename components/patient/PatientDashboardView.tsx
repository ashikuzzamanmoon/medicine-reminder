"use client";

import { useEffect, useState, useCallback } from "react";
import PushNotificationManager from "@/components/PushNotificationManager";
import { formatBanglaTime, formatBanglaVoiceTime } from "@/lib/timezone";

interface PatientDashboardData {
  patient: {
    id: string;
    name: string;
    phone: string | null;
    age: number | null;
  };
  caregiver?: {
    name: string;
    phone: string | null;
    relation: string;
  } | null;
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
}

// রোগীর দৃষ্টিকোণ থেকে কেয়ারগিভারের বিপরীত সম্পর্ক নির্ধারণ
function getCaregiverInverseRelation(relation: string): string {
  const r = (relation || "").trim();
  if (r === "বাবা" || r === "মা") return "ছেলে";
  if (r === "দাদা" || r === "দাদী" || r === "নানা" || r === "নানী") return "নাতি";
  if (r === "স্বামী") return "স্ত্রী";
  if (r === "স্ত্রী") return "স্বামী";
  if (r === "ভাই" || r === "বোন") return "ভাই / বোন";
  if (r === "ছেলে" || r === "মেয়ে") return "বাবা / মা";
  return "স্বজন";
}

export default function PatientDashboardView({
  patientId,
  userName,
}: {
  patientId: string;
  userName?: string;
}) {
  const [data, setData] = useState<PatientDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [speakingDoseId, setSpeakingDoseId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const res = await fetch(`/api/patients/${patientId}/dashboard`);
      const result = await res.json();
      if (result.success) {
        setData(result);
      }
    } catch (err) {
      console.error("Patient dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ওষুধ খাওয়া নিশ্চিত করা
  const handleMarkAsTaken = async (doseId: string) => {
    setActionLoading(doseId);
    try {
      const res = await fetch(`/api/doses/${doseId}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "TAKEN" }),
      });
      if (res.ok) {
        speakText("ওষুধ খাওয়া সম্পন্ন হয়েছে। আলহামদুলিল্লাহ, সুস্থ থাকুন।");
        loadData();
      }
    } catch (err) {
      console.error("Dose confirm error:", err);
    } finally {
      setActionLoading(null);
    }
  };

  // বাংলা ভয়েসে পড়ে শুনানো
  const speakText = (text: string, doseId?: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    if (doseId) setSpeakingDoseId(doseId);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "bn-BD";
    utterance.rate = 0.9;
    utterance.onend = () => setSpeakingDoseId(null);
    utterance.onerror = () => setSpeakingDoseId(null);

    window.speechSynthesis.speak(utterance);
  };

  const handleLogout = async () => {
    if (confirm("আপনি কি নিশ্চিত যে লগআউট করতে চান?")) {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50/40 pb-20">
      {/* Patient Header */}
      <header className="bg-white border-b border-emerald-100 sticky top-0 z-10 shadow-xs">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💊</span>
            <span className="text-lg sm:text-xl font-black text-emerald-900 tracking-tight">
              আমার ওষুধ
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="px-3.5 py-1.5 text-xs font-bold text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-gray-200"
          >
            🚪 লগআউট
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-6 space-y-6">
        {/* Welcome Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-emerald-100">
          <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-black rounded-full mb-2">
            রোগীর অ্যাকাউন্ট 📱
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
            আসসালামু আলাইকুম, {data?.patient.name || userName || "রোগী"}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            আজকের আপনার নির্ধারিত ওষুধের তালিকা নিচে দেওয়া হলো। সময়মতো ওষুধ গ্রহণ করুন।
          </p>

          {data?.caregiver && (
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2">
              <div className="text-xs sm:text-sm text-gray-600">
                <span>তত্ত্বাবধান করছেন: </span>
                <span className="font-bold text-gray-900">
                  {data.caregiver.name} ({getCaregiverInverseRelation(data.caregiver.relation)})
                </span>
              </div>
              {data.caregiver.phone && (
                <a
                  href={`tel:${data.caregiver.phone}`}
                  className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  📞 কল করুন
                </a>
              )}
            </div>
          )}
        </div>

        {/* Push Notification Manager */}
        <PushNotificationManager />

        {/* Today's Medicines for the Patient */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg sm:text-xl font-black text-gray-900 flex items-center gap-2">
              <span>🕒 আজকের ওষুধসমূহ</span>
            </h3>
            {data && (
              <span className="text-xs font-bold bg-white px-3 py-1.5 rounded-xl border border-emerald-100 text-emerald-800">
                খেয়েছেন: {data.summary.taken}/{data.summary.total}
              </span>
            )}
          </div>

          {loading ? (
            <div className="bg-white rounded-3xl p-12 text-center text-gray-400 font-medium text-sm border border-gray-100">
              ওষুধের তালিকা লোড হচ্ছে...
            </div>
          ) : !data || data.todayDoses.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-emerald-100 shadow-sm">
              <span className="text-4xl">🎉</span>
              <h4 className="text-lg font-bold text-gray-900 mt-3">আজকের কোনো ওষুধ বাকি নেই!</h4>
              <p className="text-xs text-gray-500 mt-1">আপনার সব ওষুধ খাওয়া সম্পন্ন হয়েছে অথবা আজ কোনো শিডিউল নেই।</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.todayDoses.map((dose) => {
                const med = dose.schedule.medicine;
                const isTaken = dose.status === "TAKEN" || dose.status === "LATE";
                const timingText =
                  med.foodTiming === "BEFORE"
                    ? "খাবারের আগে"
                    : med.foodTiming === "AFTER"
                    ? "খাবারের পরে"
                    : "";

                return (
                  <div
                    key={dose.id}
                    className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all shadow-sm ${
                      isTaken
                        ? "border-emerald-200 bg-emerald-50/20"
                        : "border-gray-200 hover:border-emerald-300"
                    }`}
                  >
                    {/* Top Row: Time & Food Timing */}
                    <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-900 font-bold text-xs sm:text-sm rounded-xl">
                          🕒 {formatBanglaTime(dose.schedule.time)}
                        </span>
                        {timingText && (
                          <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-xl">
                            {timingText}
                          </span>
                        )}
                      </div>

                      {/* Voice Button */}
                      <button
                        type="button"
                        onClick={() => {
                          const timeVoice = formatBanglaVoiceTime(dose.schedule.time);
                          speakText(
                            `${timeVoice} আপনার ${med.name} ওষুধ খাওয়ার সময়। পরিমাণ ${med.dose}। ${timingText ? timingText + " খাবেন।" : ""}`,
                            dose.id
                          );
                        }}
                        className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors ${
                          speakingDoseId === dose.id
                            ? "bg-purple-600 text-white animate-pulse"
                            : "bg-purple-50 text-purple-700 hover:bg-purple-100"
                        }`}
                        title="মুখে শুনুন"
                      >
                        {speakingDoseId === dose.id ? "🔊 বলা হচ্ছে..." : "🔊 মুখে শুনুন"}
                      </button>
                    </div>

                    {/* Middle Row: Big Medicine Name & Dose */}
                    <div className="py-4">
                      <h4 className="text-xl sm:text-2xl font-black text-gray-900">
                        {med.name}
                      </h4>
                      <p className="text-sm sm:text-base font-bold text-emerald-700 mt-1">
                        ডোজ: {med.dose}
                      </p>
                    </div>

                    {/* Action Button: Big Touch Target for Seniors */}
                    <div className="pt-2">
                      {isTaken ? (
                        <div className="w-full py-3.5 bg-emerald-100 text-emerald-800 rounded-2xl font-black text-center text-sm sm:text-base flex items-center justify-center gap-2 shadow-xs">
                          <span>✅ আলহামদুলিল্লাহ, ওষুধ খাওয়া হয়েছে</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleMarkAsTaken(dose.id)}
                          disabled={actionLoading === dose.id}
                          className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-base sm:text-lg shadow-md hover:shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {actionLoading === dose.id ? (
                            <span>সংরক্ষণ হচ্ছে...</span>
                          ) : (
                            <span>আমি খেয়েছি ✅</span>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

