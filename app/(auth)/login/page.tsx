"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type LoginStep = "PHONE" | "ENTER_PIN" | "REGISTER" | "SET_INITIAL_PIN" | "FORGOT_PIN";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<LoginStep>("PHONE");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPin, setNewPin] = useState("");
  const [existingUserName, setExistingUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // ১. ফোন নম্বর যাচাই করে পরবর্তী ধাপে যাওয়া
  const handleCheckPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/auth/check-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (data.exists) {
        setExistingUserName(data.name);
        if (data.hasPin) {
          setStep("ENTER_PIN");
        } else {
          setStep("SET_INITIAL_PIN");
        }
      } else {
        setStep("REGISTER");
      }
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ২. পিন দিয়ে লগইন / নিবন্ধন
  const handlePinAuth = async (action: "LOGIN" | "REGISTER" | "SET_INITIAL_PIN") => {
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/auth/pin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          phone,
          pin,
          name: name || undefined,
          email: email || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (data.needsInitialPin) {
        setStep("SET_INITIAL_PIN");
        return;
      }

      setSuccessMsg("লগইন সফল হয়েছে! ড্যাশবোর্ডে প্রবেশ করা হচ্ছে...");
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1000);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ৩. পিন রিসেট সাবমিট
  const handleResetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/auth/reset-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          email,
          resetCode,
          newPin,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccessMsg("নতুন পিন সফলভাবে সংরক্ষিত হয়েছে! ড্যাশবোর্ডে প্রবেশ করা হচ্ছে...");
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1000);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-gray-100">
        {/* Logo and Header */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-block group mb-2" title="হোম পেজে যান">
            <span className="text-4xl group-hover:scale-110 transition-transform inline-block">💊</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            {step === "REGISTER"
              ? "নতুন অ্যাকাউন্ট তৈরি করুন"
              : step === "FORGOT_PIN"
              ? "পিন রিসেট করুন"
              : "লগইন করুন"}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1.5">
            {step === "REGISTER"
              ? "আপনার নাম ও ৪ ডিজিটের গোপন পিন দিয়ে নিবন্ধন করুন"
              : step === "ENTER_PIN"
              ? "আপনার ৪ ডিজিটের পিন দিয়ে এক ক্লিকে প্রবেশ করুন"
              : step === "FORGOT_PIN"
              ? "সংযুক্ত জিমেইল দিয়ে নতুন পিন সেট করুন"
              : "ফোন নম্বর ও ৪ ডিজিটের পিন দিয়ে সহজে লগইন করুন"}
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-red-50 text-red-700 text-xs sm:text-sm font-semibold rounded-2xl border border-red-200">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3.5 bg-emerald-50 text-emerald-800 text-xs sm:text-sm font-semibold rounded-2xl border border-emerald-200">
            {successMsg}
          </div>
        )}

        {/* ধাপ ১: ফোন নম্বর ইনপুট */}
        {step === "PHONE" && (
          <div>
            <form onSubmit={handleCheckPhone} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                  মোবাইল নম্বর
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-400 font-bold text-sm">🇧🇩 +88</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                    required
                    className="w-full pl-20 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base rounded-2xl shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
              >
                {loading ? "যাচাই করা হচ্ছে..." : "এগিয়ে যান →"}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-gray-400 font-bold">অথবা ১-ক্লিকে</span>
              </div>
            </div>

            {/* Google Login Button */}
            <button
              type="button"
              onClick={() => alert("Google OAuth কনফিগারেশন যুক্ত করতে আপনার Google Client ID ক্লাউড কনসোলে সেট করুন।")}
              className="w-full py-3 px-4 border border-gray-200 hover:bg-gray-50 text-gray-800 font-bold text-sm rounded-2xl flex items-center justify-center gap-3 transition-colors shadow-xs"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Google দিয়ে সরাসরি লগইন</span>
            </button>
          </div>
        )}

        {/* ধাপ ২: বিদ্যমান ইউজার পিন ইনপুট */}
        {step === "ENTER_PIN" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handlePinAuth("LOGIN");
            }}
            className="space-y-4"
          >
            <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-100 flex items-center justify-between">
              <div>
                <p className="text-xs text-emerald-800 font-bold">স্বাগতম, {existingUserName || "ব্যবহারকারী"}!</p>
                <p className="text-xs text-gray-500 font-medium">{phone}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStep("PHONE");
                  setPin("");
                  setError(null);
                }}
                className="text-xs font-bold text-emerald-700 hover:underline"
              >
                পরিবর্তন ✎
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                ৪ ডিজিটের গোপন পিন (PIN)
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                placeholder="• • • •"
                required
                autoFocus
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-center text-2xl tracking-[0.5em] focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-black"
              />
            </div>

            <button
              type="submit"
              disabled={loading || pin.length < 4}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base rounded-2xl shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? "যাচাই হচ্ছে..." : "লগইন করুন 🚀"}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setStep("FORGOT_PIN");
                  setError(null);
                }}
                className="text-xs font-bold text-gray-500 hover:text-emerald-700 transition-colors"
              >
                পিন ভুলে গেছেন? জিমেইল দিয়ে রিসেট করুন 🔑
              </button>
            </div>
          </form>
        )}

        {/* ধাপ ৩: নতুন ইউজার নিবন্ধন */}
        {step === "REGISTER" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handlePinAuth("REGISTER");
            }}
            className="space-y-4"
          >
            <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200 flex items-center justify-between text-xs">
              <span className="text-gray-600 font-medium">নম্বর: <strong>{phone}</strong></span>
              <button
                type="button"
                onClick={() => {
                  setStep("PHONE");
                  setError(null);
                }}
                className="font-bold text-emerald-700 hover:underline"
              >
                পরিবর্তন ✎
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">
                আপনার নাম *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="যেমন: আশিকুজ্জামান"
                required
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">
                ৪ ডিজিটের গোপন পিন সেট করুন *
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                placeholder="• • • •"
                required
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-center text-xl tracking-[0.4em] focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-black"
              />
              <p className="text-[11px] text-gray-500 mt-1">লগইন করার জন্য বিকাশ পিনের মতো ৪টি সংখ্যা দিন।</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">
                জিমেইল (ঐচ্ছিক — পিন রিকভারির জন্য)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yourname@gmail.com"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={loading || pin.length < 4}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base rounded-2xl shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? "নিবন্ধন হচ্ছে..." : "নিবন্ধন সম্পন্ন করুন 🚀"}
            </button>
          </form>
        )}

        {/* ধাপ ৪: প্রাথমিক পিন সেট (মাইগ্রেশন ইউজার) */}
        {step === "SET_INITIAL_PIN" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handlePinAuth("SET_INITIAL_PIN");
            }}
            className="space-y-4"
          >
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-800 font-medium">
              আপনার অ্যাকাউন্টে এখনও পিন সেট করা নেই। পরবর্তীতে সহজে লগইন করার জন্য একটি ৪ ডিজিটের পিন সেট করে নিন।
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">
                নতুন ৪ ডিজিট পিন *
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                placeholder="• • • •"
                required
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-center text-xl tracking-[0.4em] focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-black"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">
                জিমেইল (ঐচ্ছিক — পিন রিকভারির জন্য)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yourname@gmail.com"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={loading || pin.length < 4}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base rounded-2xl shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? "সংরক্ষণ হচ্ছে..." : "পিন সেভ করে লগইন করুন"}
            </button>
          </form>
        )}

        {/* ধাপ ৫: পিন ভুলে গেলে জিমেইল দিয়ে রিসেট */}
        {step === "FORGOT_PIN" && (
          <form onSubmit={handleResetPin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">
                আপনার জিমেইল (Gmail) *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yourname@gmail.com"
                required
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">
                ভেরিফিকেশন কোড * (বর্তমান টেস্ট কোড: 123456)
              </label>
              <input
                type="text"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                placeholder="123456"
                required
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-center text-base tracking-widest focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">
                নতুন ৪ ডিজিট পিন *
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                placeholder="• • • •"
                required
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-center text-xl tracking-[0.4em] focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-black"
              />
            </div>

            <button
              type="submit"
              disabled={loading || newPin.length < 4}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base rounded-2xl shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? "পরিবর্তন হচ্ছে..." : "নতুন পিন সংরক্ষণ করে লগইন করুন"}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setStep("ENTER_PIN");
                  setError(null);
                }}
                className="text-xs font-bold text-gray-500 hover:text-emerald-700 transition-colors"
              >
                ← লগইন স্ক্রিনে ফিরে যান
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
