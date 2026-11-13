"use client";

import { useState, useEffect } from "react";
import { formatBanglaTime } from "@/lib/timezone";

interface ScheduleItem {
  time: string;
  label: string;
}

interface EditMedicineModalProps {
  medicineId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditMedicineModal({
  medicineId,
  onClose,
  onSuccess,
}: EditMedicineModalProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [dose, setDose] = useState("");
  const [foodTiming, setFoodTiming] = useState("AFTER");
  const [stockCount, setStockCount] = useState("");
  const [notes, setNotes] = useState("");
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);

  // ওষুধের তথ্য ডাটাবেস থেকে লোড করা
  useEffect(() => {
    async function fetchMedicine() {
      try {
        setLoading(true);
        const res = await fetch(`/api/medicines/${medicineId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "লোড করতে ব্যর্থ");

        const med = data.medicine;
        setName(med.name || "");
        setDose(med.dose || "");
        setFoodTiming(med.foodTiming || "AFTER");
        setStockCount(med.stockCount !== null && med.stockCount !== undefined ? String(med.stockCount) : "");
        setNotes(med.notes || "");
        if (med.schedules && med.schedules.length > 0) {
          setSchedules(
            med.schedules.map((s: { time: string; label: string | null }) => ({
              time: s.time,
              label: s.label || "",
            }))
          );
        } else {
          setSchedules([{ time: "08:00", label: "সকাল" }]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "ওষুধ লোড করতে সমস্যা হয়েছে");
      } finally {
        setLoading(false);
      }
    }
    fetchMedicine();
  }, [medicineId]);

  const addScheduleTime = () => {
    setSchedules([...schedules, { time: "13:00", label: "দুপুর" }]);
  };

  const removeScheduleTime = (idx: number) => {
    if (schedules.length <= 1) return;
    setSchedules(schedules.filter((_, i) => i !== idx));
  };

  const updateSchedule = (idx: number, field: "time" | "label", val: string) => {
    const updated = [...schedules];
    updated[idx][field] = val;
    setSchedules(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/medicines/${medicineId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          dose,
          foodTiming,
          stockCount: stockCount ? parseInt(stockCount, 10) : null,
          notes,
          schedules,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "আপডেট করতে ব্যর্থ");

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "আপডেট করতে সমস্যা হয়েছে");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`আপনি কি নিশ্চিত যে "${name}" ওষুধটি মুছে ফেলতে চান?`)) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/medicines/${medicineId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "মুছতে ব্যর্থ");

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "মুছতে সমস্যা হয়েছে");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-gray-100">
          <div>
            <h3 className="text-xl font-black text-gray-900">ওষুধের তথ্য পরিবর্তন</h3>
            <p className="text-xs text-gray-500 mt-0.5">সময়সূচি ও অন্যান্য তথ্য এডিট করুন</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 text-xs sm:text-sm rounded-xl font-medium border border-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-gray-400 font-medium text-sm">
            তথ্য লোড হচ্ছে...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                ওষুধের নাম <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="যেমন: Napa Extra / Seclo 20 mg"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>

            {/* Dose & Food Timing */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  ডোজ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={dose}
                  onChange={(e) => setDose(e.target.value)}
                  placeholder="১টি ট্যাবলেট"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  খাবারের সাথে সময়
                </label>
                <select
                  value={foodTiming}
                  onChange={(e) => setFoodTiming(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm bg-white focus:ring-2 focus:ring-green-500 outline-none"
                >
                  <option value="BEFORE">খাবারের আগে</option>
                  <option value="AFTER">খাবারের পরে</option>
                  <option value="ANY">যেকোনো সময়</option>
                </select>
              </div>
            </div>

            {/* Schedules with 12-hour Bangla preview */}
            <div className="pt-2">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-gray-700">
                  খাওয়ার সময়সূচি <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={addScheduleTime}
                  className="text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-lg hover:bg-green-100 transition-colors"
                >
                  + সময় যোগ
                </button>
              </div>

              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {schedules.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        required
                        value={item.time}
                        onChange={(e) => updateSchedule(idx, "time", e.target.value)}
                        className="px-3 py-1.5 bg-white rounded-xl border border-gray-300 text-sm font-bold text-gray-800 outline-none w-32"
                      />
                      <input
                        type="text"
                        placeholder="লেবেল (যেমন: সকাল)"
                        value={item.label}
                        onChange={(e) => updateSchedule(idx, "label", e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-white rounded-xl border border-gray-300 text-xs outline-none"
                      />
                      {schedules.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeScheduleTime(idx)}
                          className="text-red-500 hover:text-red-700 p-1.5 text-xs font-bold"
                          title="মুছে ফেলুন"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    {/* Live 12-hour Bangla Preview */}
                    <div className="text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5">
                      <span>🕒 বাংলা সময়:</span>
                      <span className="font-bold">{formatBanglaTime(item.time)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stock Count */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                বর্তমান স্টক (ট্যাবলেট সংখ্যা)
              </label>
              <input
                type="number"
                min="0"
                value={stockCount}
                onChange={(e) => setStockCount(e.target.value)}
                placeholder="যেমন: ৩০"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>

            {/* Actions */}
            <div className="pt-4 flex items-center justify-between gap-3 border-t border-gray-100">
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting || saving}
                className="px-4 py-2.5 text-red-600 hover:bg-red-50 font-bold rounded-xl text-xs sm:text-sm transition-colors disabled:opacity-50"
              >
                {deleting ? "মুছে ফেলা হচ্ছে..." : "ওষুধ মুছুন 🗑️"}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-gray-600 hover:bg-gray-100 font-bold rounded-xl text-xs sm:text-sm transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={saving || deleting}
                  className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-black rounded-xl text-xs sm:text-sm shadow-md transition-all disabled:opacity-50 active:scale-95"
                >
                  {saving ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন ✅"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
