"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatBanglaTime } from "@/lib/timezone";

interface PatientOption {
  id: string;
  name: string;
  relation: string;
  profileId?: string;
}

export default function MedicineForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [fetchingPatients, setFetchingPatients] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    patientProfileId: "",
    name: "",
    dose: "১টি ট্যাবলেট",
    foodTiming: "AFTER",
    stockCount: "30",
    notes: "",
  });

  const [schedules, setSchedules] = useState<{ time: string; label: string }[]>([
    { time: "08:00", label: "সকাল" },
    { time: "20:00", label: "রাত" },
  ]);

  useEffect(() => {
    async function loadPatients() {
      try {
        const res = await fetch("/api/patients");
        const data = await res.json();
        if (data.patients && data.patients.length > 0) {
          setPatients(data.patients);
          // প্রথম রোগীর profileId সিলেক্ট করি
          setFormData((prev) => ({ ...prev, patientProfileId: data.patients[0].id }));
        }
      } catch (err) {
        console.error("Error loading patients:", err);
      } finally {
        setFetchingPatients(false);
      }
    }
    loadPatients();
  }, []);

  const addScheduleTime = () => {
    setSchedules([...schedules, { time: "13:00", label: "দুপুর" }]);
  };

  const removeScheduleTime = (index: number) => {
    if (schedules.length === 1) return;
    setSchedules(schedules.filter((_, i) => i !== index));
  };

  const updateSchedule = (index: number, field: "time" | "label", val: string) => {
    const updated = [...schedules];
    updated[index][field] = val;
    setSchedules(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/medicines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientProfileId: formData.patientProfileId,
          name: formData.name,
          dose: formData.dose,
          foodTiming: formData.foodTiming,
          stockCount: formData.stockCount ? parseInt(formData.stockCount, 10) : undefined,
          notes: formData.notes || undefined,
          schedules,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "ওষুধ যোগ করতে সমস্যা হয়েছে");
      }

      setSuccess("ওষুধ এবং সময়সূচি সফলভাবে সংরক্ষিত হয়েছে!");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("অপ্রত্যাশিত ত্রুটি ঘটেছে");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">নতুন ওষুধ ও সময়সূচি যোগ করুন</h2>
        <p className="text-sm text-gray-500">প্রতিদিনের রিমাইন্ডার এবং মিসড অ্যালার্টের জন্য সঠিক তথ্য দিন</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-medium">
          {success}
        </div>
      )}

      {/* Patient Selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          কাদের জন্য ওষুধ? <span className="text-red-500">*</span>
        </label>
        {fetchingPatients ? (
          <p className="text-sm text-gray-500">রোগীর তালিকা লোড হচ্ছে...</p>
        ) : patients.length === 0 ? (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 flex justify-between items-center">
            <span>কোনো রোগীর প্রোফাইল নেই! আগে রোগী যোগ করুন।</span>
            <a href="/patients/new" className="font-bold underline text-amber-900">রোগী যোগ করুন</a>
          </div>
        ) : (
          <select
            value={formData.patientProfileId}
            onChange={(e) => setFormData({ ...formData, patientProfileId: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all bg-white"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.profileId || p.id}>
                {p.name} ({p.relation})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Medicine Name & Dose */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            ওষুধের নাম <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="যেমন: Seclo 20mg / Napa Extra"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            ডোজ <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="যেমন: ১টি ট্যাবলেট / ১ চামচ"
            value={formData.dose}
            onChange={(e) => setFormData({ ...formData, dose: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Food Timing & Stock Count */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            খাবারের সাথে সময়
          </label>
          <select
            value={formData.foodTiming}
            onChange={(e) => setFormData({ ...formData, foodTiming: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all bg-white"
          >
            <option value="BEFORE">খাবারের আগে</option>
            <option value="AFTER">খাবারের পরে</option>
            <option value="ANY">যেকোনো সময়</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            বর্তমান স্টক (ট্যাবলেট সংখ্যা)
          </label>
          <input
            type="number"
            min="0"
            placeholder="যেমন: ৩০"
            value={formData.stockCount}
            onChange={(e) => setFormData({ ...formData, stockCount: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Dynamic Schedules */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-semibold text-gray-800">
            খাওয়ার সময়সূচি <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            onClick={addScheduleTime}
            className="text-xs font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors"
          >
            + আরও সময় যোগ করুন
          </button>
        </div>

        <div className="space-y-3">
          {schedules.map((item, idx) => (
            <div key={idx} className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  required
                  value={item.time}
                  onChange={(e) => updateSchedule(idx, "time", e.target.value)}
                  className="w-32 sm:w-36 px-2.5 py-1.5 bg-white rounded-xl border border-gray-300 text-xs sm:text-sm outline-none font-bold text-gray-800 shrink-0"
                />
                <input
                  type="text"
                  placeholder="লেবেল (যেমন: সকাল)"
                  value={item.label}
                  onChange={(e) => updateSchedule(idx, "label", e.target.value)}
                  className="flex-1 min-w-0 px-2.5 py-1.5 bg-white rounded-xl border border-gray-300 text-xs outline-none"
                />
                {schedules.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeScheduleTime(idx)}
                    className="w-7 h-7 flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg text-xs font-bold shrink-0 transition-colors"
                    title="মুছে ফেলুন"
                  >
                    ✕
                  </button>
                )}
              </div>
              {/* Live 12-hour Bangla preview */}
              <div className="text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 w-fit">
                <span>🕒 বাংলা সময়:</span>
                <span className="font-bold">{formatBanglaTime(item.time)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-lg transition-colors flex items-center justify-center disabled:opacity-50"
      >
        {loading ? "সংরক্ষণ করা হচ্ছে..." : "ওষুধ সংরক্ষণ করুন"}
      </button>
    </form>
  );
}

