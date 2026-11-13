"use client";

import { useEffect, useState, useCallback } from "react";
import { formatBanglaTime, formatBanglaVoiceTime } from "@/lib/timezone";

interface DoseDetails {
  id: string;
  scheduledAt: string;
  status: string;
  schedule: {
    time: string;
    label: string | null;
    medicine: {
      name: string;
      dose: string;
      foodTiming: string;
      notes: string | null;
    };
  };
}

export default function ReminderCard({ doseId }: { doseId: string }) {
  const [dose, setDose] = useState<DoseDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "info" | "error"; text: string } | null>(null);

  const speakReminder = useCallback((text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "bn-BD";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  useEffect(() => {
    async function fetchDose() {
      try {
        const res = await fetch(`/api/doses/${doseId}`);
        const data = await res.json();
        if (data.dose) {
          setDose(data.dose);
          const medicine = data.dose.schedule.medicine;
          const timing = medicine.foodTiming === "BEFORE" ? "খাবারের আগে" : medicine.foodTiming === "AFTER" ? "খাবারের পরে" : "";

          // শুধুমাত্র যদি ডোজটি এখনও PENDING থাকে এবং নির্ধারিত সময় পার হয়ে গেছে বা বর্তমান সময় হয়েছে, তবেই স্বয়ংক্রিয়ভাবে বলবে
          const scheduledTime = new Date(data.dose.scheduledAt).getTime();
          const now = Date.now();
          const isDue = now >= (scheduledTime - 15 * 60 * 1000); // ১৫ মিনিট আগে থেকে

          if (data.dose.status === "PENDING" && isDue) {
            const timeVoice = formatBanglaVoiceTime(data.dose.schedule.time);
            const text = `${timeVoice} আপনার ${medicine.name} ওষুধ খাওয়ার সময়। পরিমাণ ${medicine.dose}। ${timing ? timing + " খাবেন।" : ""}`;
            speakReminder(text);
          }
        }
      } catch (err) {
        console.error("Failed to load dose details:", err);
      } finally {
        setLoading(false);
      }
    }
    if (doseId) {
      fetchDose();
    }
  }, [doseId, speakReminder]);

  const handleAction = async (status: "TAKEN" | "SNOOZE" | "SKIPPED") => {
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/doses/${doseId}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "অ্যাকশন সম্পন্ন করতে সমস্যা হয়েছে");
      }

      if (status === "TAKEN") {
        setMessage({ type: "success", text: "✅ ওষুধ খাওয়ার তথ্য সংরক্ষিত হয়েছে! সুস্থ থাকুন।" });
        speakReminder("ওষুধ খাওয়া সম্পন্ন হয়েছে। ধন্যবাদ।");
      } else if (status === "SNOOZE") {
        setMessage({ type: "info", text: "⏰ ঠিক আছে, ৩০ মিনিট পরে আপনাকে আবার মনে করিয়ে দেওয়া হবে।" });
      } else {
        setMessage({ type: "info", text: "রেকর্ড রাখা হয়েছে।" });
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMessage({ type: "error", text: err.message });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-xl font-bold text-gray-700">ওষুধের তথ্য লোড হচ্ছে...</p>
      </div>
    );
  }

  if (!dose) {
    return (
      <div className="text-center py-16 px-4 bg-white rounded-3xl shadow-md border border-gray-100 max-w-lg mx-auto">
        <p className="text-2xl font-bold text-gray-800 mb-4">কোনো নির্ধারিত ডোজ পাওয়া যায়নি</p>
        <a href="/" className="inline-block px-8 py-4 bg-green-600 text-white font-bold rounded-2xl text-lg">
          হোমে ফিরে যান
        </a>
      </div>
    );
  }

  const medicine = dose.schedule.medicine;

  return (
    <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Top Banner */}
      <div className="bg-green-600 text-white p-6 sm:p-8 text-center">
        <span className="inline-block bg-green-700/60 px-4 py-1.5 rounded-full text-base font-medium mb-3">
          🕒 {formatBanglaTime(dose.schedule.time)} {dose.schedule.label ? `(${dose.schedule.label})` : ""}
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{medicine.name}</h1>
        <p className="text-xl text-green-100 mt-2 font-semibold">ডোজ: {medicine.dose}</p>
      </div>

      {/* Details Box */}
      <div className="p-6 sm:p-8 space-y-6">
        <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">নির্দেশনা</p>
            <p className="text-xl font-bold text-gray-800">
              {medicine.foodTiming === "BEFORE" ? "খাবারের আগে" : medicine.foodTiming === "AFTER" ? "খাবারের পরে" : "যেকোনো সময়"}
            </p>
          </div>
          <button
            onClick={() => {
              const timeVoice = formatBanglaVoiceTime(dose.schedule.time);
              speakReminder(`${timeVoice} আপনার ${medicine.name} ওষুধ খাওয়ার সময়। পরিমাণ ${medicine.dose}।`);
            }}
            className="p-3 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
            title="ভয়েস শুনুন"
          >
            🔊
          </button>
        </div>

        {message && (
          <div
            className={`p-5 rounded-2xl text-lg font-bold text-center ${
              message.type === "success"
                ? "bg-green-100 text-green-900 border border-green-300"
                : message.type === "error"
                ? "bg-red-100 text-red-900 border border-red-300"
                : "bg-amber-100 text-amber-900 border border-amber-300"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* If already taken or action completed */}
        {dose.status === "TAKEN" || dose.status === "LATE" || message ? (
          <div className="pt-4 text-center space-y-4">
            {!message && (
              <div className="p-4 bg-emerald-100 text-emerald-900 rounded-2xl font-bold text-base sm:text-lg border border-emerald-300">
                ✅ এই ওষুধটি ইতিমধ্যে খাওয়া সম্পন্ন হয়েছে!
              </div>
            )}
            <a
              href="/dashboard"
              className="inline-block w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-lg shadow-md transition-colors"
            >
              ড্যাশবোর্ডে ফিরে যান →
            </a>
          </div>
        ) : (
          /* Large Action Buttons */
          <div className="space-y-4 pt-2">
            {/* Primary Action Button: "খেয়েছি" */}
            <button
              onClick={() => handleAction("TAKEN")}
              disabled={submitting}
              className="w-full h-20 bg-green-600 hover:bg-green-700 active:scale-[0.98] text-white rounded-2xl text-2xl font-black shadow-lg shadow-green-600/30 flex items-center justify-center gap-3 transition-all disabled:opacity-50"
            >
              <span>✅</span>
              <span>খেয়েছি</span>
            </button>

            {/* Secondary: "পরে খাবো" */}
            <button
              onClick={() => handleAction("SNOOZE")}
              disabled={submitting}
              className="w-full h-16 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white rounded-2xl text-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <span>⏰</span>
              <span>পরে খাবো (৩০ মিনিট পর)</span>
            </button>

            {/* Danger: "খাইনি" */}
            <button
              onClick={() => handleAction("SKIPPED")}
              disabled={submitting}
              className="w-full h-14 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl text-lg font-semibold flex items-center justify-center transition-colors"
            >
              আজকে খাবো না
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

