"use client";

import { useState } from "react";
import { speakBangla } from "@/lib/speech";

export default function LandingHeroInteractive() {
  const [isTaken, setIsTaken] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [showCaregiverAlert, setShowCaregiverAlert] = useState(false);

  const handleListen = () => {
    setSpeaking(true);
    speakBangla(
      "সন্ধ্যা ৭টা বেজে ৪৫ মিনিটে আপনার নাপা এক্সট্রা ওষুধ খাওয়ার সময়। পরিমাণ ১টি ট্যাবলেট। খাবারের পরে খাবেন।",
      {
        onEnd: () => setSpeaking(false),
        onError: () => setSpeaking(false),
      }
    );
  };

  const handleTakeMedicine = () => {
    setIsTaken(true);
    speakBangla("ওষুধ খাওয়া সম্পন্ন হয়েছে। আলহামদুলিল্লাহ, সুস্থ থাকুন।");
    setShowCaregiverAlert(true);
  };

  const handleReset = () => {
    setIsTaken(false);
    setShowCaregiverAlert(false);
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Decorative Glow */}
      <div className="absolute -inset-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500 rounded-3xl blur-xl opacity-30 animate-pulse"></div>

      {/* Floating Caregiver Notification Preview */}
      {showCaregiverAlert && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-11/12 bg-white/95 backdrop-blur-md border border-emerald-200 rounded-2xl p-3 shadow-xl z-20 animate-bounce duration-1000 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-xl shrink-0">
            🔔
          </div>
          <div className="text-left text-xs">
            <p className="font-extrabold text-gray-900">কেয়ারগিভার অ্যালার্ট (ছেলের ফোনে):</p>
            <p className="text-emerald-700 font-semibold">✅ আপনার বাবা সন্ধ্যা ৭:৪৫-এর নাপা এক্সট্রা খেয়েছেন!</p>
          </div>
        </div>
      )}

      {/* Main Interactive Phone Card */}
      <div className="relative bg-white/95 backdrop-blur-sm rounded-3xl p-6 sm:p-7 border border-emerald-100 shadow-2xl text-left transition-all">
        {/* Device Top Pill */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-xs font-black text-emerald-900 uppercase tracking-wider">
              লাইভ ডেমো পরীক্ষা করুন
            </span>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
            রোগীর স্ক্রিন 📱
          </span>
        </div>

        {/* Medicine Details */}
        <div className="py-5">
          <div className="flex items-center justify-between mb-2">
            <span className="px-3 py-1 bg-emerald-100 text-emerald-900 font-extrabold text-xs rounded-xl flex items-center gap-1.5">
              <span>🕒</span>
              <span>সন্ধ্যা ৭:৪৫</span>
            </span>
            <span className="px-2.5 py-1 bg-amber-50 text-amber-800 text-xs font-bold rounded-xl border border-amber-200">
              খাবারের পরে
            </span>
          </div>

          <h3 className="text-2xl font-black text-gray-900 mt-2">Napa Extra</h3>
          <p className="text-emerald-700 font-bold text-sm mt-0.5">১টি ট্যাবলেট</p>
        </div>

        {/* Action Controls */}
        <div className="space-y-3 pt-1">
          {/* Voice listen button */}
          <button
            type="button"
            onClick={handleListen}
            className={`w-full py-2.5 px-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all border ${
              speaking
                ? "bg-purple-600 text-white border-purple-600 animate-pulse"
                : "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
            }`}
          >
            <span>{speaking ? "🔊 বলা হচ্ছে..." : "🔊 বাংলায় মুখে শুনুন (ক্লিক করুন)"}</span>
          </button>

          {/* Big Take Medicine button */}
          {!isTaken ? (
            <button
              type="button"
              onClick={handleTakeMedicine}
              className="w-full h-16 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-black text-xl rounded-2xl shadow-lg shadow-emerald-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
            >
              <span>আমি খেয়েছি</span>
              <span className="text-2xl">✅</span>
            </button>
          ) : (
            <div className="space-y-2">
              <div className="w-full h-16 bg-emerald-100/90 text-emerald-900 font-black text-lg rounded-2xl border-2 border-emerald-400 flex items-center justify-center gap-2 animate-in fade-in zoom-in-95">
                <span>আলহামদুলিল্লাহ, ওষুধ খাওয়া হয়েছে!</span>
                <span>✨</span>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="w-full text-center text-xs font-bold text-gray-500 hover:text-emerald-700 py-1 transition-colors underline"
              >
                🔄 আবার পরীক্ষা করুন
              </button>
            </div>
          )}
        </div>

        {/* Bottom Reassurance hint */}
        <p className="text-[11px] text-gray-400 text-center mt-4">
          💡 বোতামে চাপ দিলে তৎক্ষণাৎ সন্তানের মোবাইলে কনফার্মেশন চলে যায়
        </p>
      </div>
    </div>
  );
}
