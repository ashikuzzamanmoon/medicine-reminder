"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [step, setStep] = useState<"PHONE" | "OTP">("PHONE");
  const [loading, setLoading] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ১. ওটিপি পাঠানোর ফাংশন
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (data.devOtp) {
        setDevOtp(data.devOtp);
      }
      setStep("OTP");
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ২. ওটিপি যাচাই ও লগইন
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          otp,
          name: name || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // সফল হলে অনবোর্ডিং বা ড্যাশবোর্ডে রিডাইরেক্ট
      router.push("/onboarding");
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-gray-100">
        <div className="text-center mb-8">
          <span className="text-4xl mb-2 block">💊</span>
          <h1 className="text-3xl font-extrabold text-gray-900">লগইন করুন</h1>
          <p className="text-sm text-gray-500 mt-2">
            আপনার ফোন নম্বর দিয়ে এক ক্লিকে ওটিপি (OTP) কোড পান
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm font-semibold rounded-2xl">
            {error}
          </div>
        )}

        {step === "PHONE" ? (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                মোবাইল নম্বর
              </label>
              <input
                type="tel"
                required
                placeholder="যেমন: 01712345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-lg font-medium"
              />
              <p className="text-xs text-gray-400 mt-1.5">
                ১১ ডিজিটের বাংলাদেশি মোবাইল নম্বর লিখুন
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl text-lg transition-all shadow-md disabled:opacity-50"
            >
              {loading ? "ওটিপি পাঠানো হচ্ছে..." : "ওটিপি (OTP) পাঠান →"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            {devOtp && (
              <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-xs font-bold rounded-xl text-center">
                💡 Dev মোড ওটিপি কোড: <span className="text-sm font-black text-green-950 tracking-widest">{devOtp}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                আপনার নাম (প্রথমবার হলে)
              </label>
              <input
                type="text"
                placeholder="যেমন: আশিকুজ্জামান"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                ৬ ডিজিটের ওটিপি কোড
              </label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-2xl font-bold tracking-widest text-center"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl text-lg transition-all shadow-md disabled:opacity-50"
            >
              {loading ? "যাচাই করা হচ্ছে..." : "যাচাই করে প্রবেশ করুন"}
            </button>

            <button
              type="button"
              onClick={() => setStep("PHONE")}
              className="w-full text-center text-xs text-gray-500 hover:text-gray-800 font-semibold mt-2"
            >
              ← ফোন নম্বর পরিবর্তন করুন
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

