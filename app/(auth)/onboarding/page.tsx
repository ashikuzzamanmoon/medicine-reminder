"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();
  const [selectedMode, setSelectedMode] = useState<"FAMILY" | "SELF">("FAMILY");
  const [age, setAge] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // বর্তমান সক্রিয় মোড লোড করে আগে থেকেই সিলেক্ট রাখা
  useEffect(() => {
    async function loadCurrentMode() {
      try {
        const res = await fetch("/api/patients");
        const data = await res.json();
        if (data.currentUser?.mode) {
          setSelectedMode(data.currentUser.mode);
        }
      } catch (err) {
        console.error("Load mode error:", err);
      }
    }
    loadCurrentMode();
  }, []);

  const handleContinue = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/user/mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: selectedMode,
          selfPatientAge: age ? parseInt(age, 10) : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // মোড সংরক্ষণ শেষে সরাসরি ড্যাশবোর্ডে নিয়ে যাবে (নতুন রোগী ফর্মে নয়)
      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-gray-100">
        <div className="mb-4">
          <a
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-gray-500 hover:text-green-700 transition-colors"
          >
            ← ড্যাশবোর্ডে ফিরে যান
          </a>
        </div>

        <div className="text-center mb-8">
          <span className="text-4xl mb-2 block">⚙️</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">ব্যবহারের মোড নির্বাচন</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-2">
            আপনার প্রয়োজন অনুযায়ী অ্যাপটি কীভাবে ব্যবহার করতে চান তা বেছে নিন
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold rounded-2xl flex items-center justify-between">
            <span>{error}</span>
            {error.includes("লগইন") && (
              <a
                href="/login"
                className="px-3 py-1.5 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-colors"
              >
                লগইন করুন
              </a>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Option 1: Family Mode */}
          <div
            onClick={() => setSelectedMode("FAMILY")}
            className={`p-6 rounded-3xl border-2 cursor-pointer transition-all ${
              selectedMode === "FAMILY"
                ? "border-green-600 bg-green-50/50 shadow-md ring-2 ring-green-600/20"
                : "border-gray-200 hover:border-gray-300 bg-white"
            }`}
          >
            <span className="text-3xl mb-3 block">👨‍👩‍👧</span>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-lg">পরিবারের জন্য</h3>
              {selectedMode === "FAMILY" && <span className="text-xs font-black text-green-700 bg-green-100 px-2 py-0.5 rounded-full">সক্রিয়</span>}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              বাবা-মা, সন্তান বা পরিবারের অন্য সদস্যের ওষুধ দেখাশোনা ও মিসড অ্যালার্ট পাওয়ার জন্য (Family Mode)
            </p>
          </div>

          {/* Option 2: Self Mode */}
          <div
            onClick={() => setSelectedMode("SELF")}
            className={`p-6 rounded-3xl border-2 cursor-pointer transition-all ${
              selectedMode === "SELF"
                ? "border-green-600 bg-green-50/50 shadow-md ring-2 ring-green-600/20"
                : "border-gray-200 hover:border-gray-300 bg-white"
            }`}
          >
            <span className="text-3xl mb-3 block">🙋‍♂️</span>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-lg">আমার নিজের জন্য</h3>
              {selectedMode === "SELF" && <span className="text-xs font-black text-green-700 bg-green-100 px-2 py-0.5 rounded-full">সক্রিয়</span>}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              নিজের দৈনন্দিন ওষুধের সময়সূচি ও ব্যক্তিগত রিমাইন্ডার পরিচালনার জন্য (Self Mode)
            </p>
          </div>
        </div>

        {/* Self mode age field */}
        {selectedMode === "SELF" && (
          <div className="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-200">
            <label className="block text-xs font-semibold text-gray-700 mb-1">আপনার বয়স (বছর)</label>
            <input
              type="number"
              min="1"
              max="120"
              placeholder="যেমন: ৩০"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full px-3 py-2 bg-white rounded-xl border border-gray-300 text-sm outline-none"
            />
          </div>
        )}

        <button
          onClick={handleContinue}
          disabled={loading}
          className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl text-base sm:text-lg transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? "সংরক্ষণ করা হচ্ছে..." : "পরিবর্তন সংরক্ষণ করুন ও ড্যাশবোর্ডে যান ✅"}
        </button>
      </div>
    </div>
  );
}
