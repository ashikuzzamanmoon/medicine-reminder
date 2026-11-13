"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PrescriptionMedicineDraft } from "@/lib/prescription-schema";

export default function PrescriptionReview() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [patientProfileId, setPatientProfileId] = useState("");
  const [patients, setPatients] = useState<{ id: string; name: string }[]>([]);

  const [draftMedicines, setDraftMedicines] = useState<PrescriptionMedicineDraft[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load patients inside useEffect
  useEffect(() => {
    fetch("/api/patients")
      .then((r) => r.json())
      .then((d) => {
        if (d.patients && d.patients.length > 0) {
          setPatients(d.patients);
          setPatientProfileId(d.patients[0].id);
        }
      })
      .catch((err) => console.error("Error fetching patients:", err));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setAnalyzing(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/prescriptions/analyze", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setDraftMedicines(data.draft.medicines || []);
      setWarnings(data.draft.warnings || []);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const updateMedicine = (idx: number, field: keyof PrescriptionMedicineDraft, val: unknown) => {
    const updated = [...draftMedicines];
    (updated[idx] as Record<string, unknown>)[field] = val;
    setDraftMedicines(updated);
  };

  const removeMedicine = (idx: number) => {
    setDraftMedicines(draftMedicines.filter((_, i) => i !== idx));
  };

  const handleConfirmSave = async () => {
    if (draftMedicines.length === 0) return;
    setSaving(true);
    setError(null);

    try {
      for (const med of draftMedicines) {
        await fetch("/api/medicines", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patientProfileId,
            name: med.name,
            dose: med.dose,
            foodTiming: med.foodTiming,
            schedules: med.times.map((t) => ({ time: t })),
          }),
        });
      }
      router.push("/dashboard");
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-3xl shadow-sm border border-gray-100">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">প্রেসক্রিপশন থেকে ওষুধের খসড়া</h2>
        <p className="text-sm text-gray-500">
          ছবি আপলোড করলে AI ওষুধের নাম ও সময়সূচি বের করবে। নিশ্চিত হয়ে সেভ করুন।
        </p>
      </div>

      {error && <div className="p-4 mb-4 bg-red-50 text-red-700 rounded-xl text-sm font-semibold">{error}</div>}

      {/* Upload Box */}
      <div className="border-2 border-dashed border-gray-300 p-6 rounded-2xl text-center mb-6">
        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="rx-upload" />
        <label htmlFor="rx-upload" className="cursor-pointer flex flex-col items-center">
          <span className="text-4xl mb-2">📸</span>
          <span className="text-base font-bold text-green-700">প্রেসক্রিপশনের ছবি বেছে নিন বা ক্যামেরা দিয়ে তুলুন</span>
          <span className="text-xs text-gray-400 mt-1">JPG, PNG সাপোর্টেড</span>
        </label>
        {preview && (
          <div className="mt-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Prescription" className="max-h-60 mx-auto rounded-xl border border-gray-200" />
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="mt-4 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all disabled:opacity-50"
            >
              {analyzing ? "AI প্রেসক্রিপশন বিশ্লেষণ করছে..." : "AI দিয়ে তথ্য বের করুন"}
            </button>
          </div>
        )}
      </div>

      {/* Warnings Banner */}
      {warnings.length > 0 && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          {warnings.map((w, idx) => (
            <p key={idx} className="text-xs font-semibold text-amber-800">⚠️ {w}</p>
          ))}
        </div>
      )}

      {/* Review Extracted Medicines */}
      {draftMedicines.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900">শনাক্ত করা ওষুধসমূহ ({draftMedicines.length}টি)</h3>
            <span className="text-xs text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded-md">খসড়া অবস্থা — এখনো সেভ হয়নি</span>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-800 mb-1">রোগী বেছে নিন</label>
            <select
              value={patientProfileId}
              onChange={(e) => setPatientProfileId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm outline-none"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            {draftMedicines.map((med, idx) => (
              <div key={idx} className="p-4 rounded-2xl border border-gray-200 bg-gray-50 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="space-y-1 flex-1">
                  <input
                    type="text"
                    value={med.name}
                    onChange={(e) => updateMedicine(idx, "name", e.target.value)}
                    className="font-bold text-base bg-white border border-gray-300 px-3 py-1.5 rounded-lg w-full"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={med.dose}
                      onChange={(e) => updateMedicine(idx, "dose", e.target.value)}
                      className="text-xs bg-white border border-gray-300 px-2 py-1 rounded-md w-1/2"
                    />
                    <select
                      value={med.foodTiming}
                      onChange={(e) => updateMedicine(idx, "foodTiming", e.target.value)}
                      className="text-xs bg-white border border-gray-300 px-2 py-1 rounded-md w-1/2"
                    >
                      <option value="BEFORE">খাবারের আগে</option>
                      <option value="AFTER">খাবারের পরে</option>
                      <option value="ANY">যেকোনো সময়</option>
                    </select>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeMedicine(idx)}
                  className="text-red-500 hover:text-red-700 text-sm font-bold px-2 py-1"
                >
                  বাদ দিন ✕
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={handleConfirmSave}
            disabled={saving}
            className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl text-lg transition-all shadow-md disabled:opacity-50 mt-6"
          >
            {saving ? "ডাটাবেসে সেভ হচ্ছে..." : "যাচাই সম্পন্ন: ওষুধগুলো সেভ করুন"}
          </button>
        </div>
      )}
    </div>
  );
}
