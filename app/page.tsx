import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-2xl">💊</span>
            <span className="text-xl font-black text-gray-900 tracking-tight">ওষুধ রিমাইন্ডার</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-gray-700 hover:text-green-700 font-bold text-sm rounded-xl transition-all"
            >
              লগইন
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold text-sm rounded-xl transition-all shadow-sm"
            >
              ড্যাশবোর্ড
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-4 py-16 text-center my-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-100 text-green-800 text-xs font-bold rounded-full mb-6">
          <span>🇧🇩 বাংলাদেশের বাস্তবতায় পরিবার-চালিত সমাধান</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-gray-900 tracking-tight leading-tight mb-6">
          বাবা-মার ওষুধ মিস হলে <br />
          <span className="text-green-600">মুহূর্তেই পরিবারের কাছে অ্যালার্ট</span>
        </h1>

        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
          পরিবারের একজন ওষুধের সময়সূচি বসাবে, রোগী এক ট্যাপে &quot;খেয়েছি&quot; বলবে, আর না খেলে ছেলেমেয়ের কাছে নোটিফিকেশন চলে যাবে।
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <Link
            href="/onboarding"
            className="w-full sm:w-auto px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-black rounded-2xl text-lg shadow-lg shadow-green-600/30 transition-all active:scale-[0.98]"
          >
            ব্যবহার শুরু করুন 🚀
          </Link>
          <Link
            href="/prescriptions/review"
            className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-gray-100 border border-gray-300 text-gray-800 font-bold rounded-2xl text-lg transition-all"
          >
            📸 প্রেসক্রিপশন স্ক্যান
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-20 text-left">
          <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <span className="text-3xl mb-3 block">🔔</span>
            <h3 className="font-bold text-gray-900 text-lg mb-1">পরিবার-কেন্দ্রিক লুপ</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              নির্ধারিত সময়ের ৩০ মিনিটে কনফার্ম না করলে কেয়ারগিভারদের কাছে স্বয়ংক্রিয় মিসড অ্যালার্ট পৌঁছে যায়।
            </p>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <span className="text-3xl mb-3 block">👵</span>
            <h3 className="font-bold text-gray-900 text-lg mb-1">সহজ ও বড় বোতাম</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              বয়স্কদের সুবিধার্থে ৮০px বড় বোতাম, সহজ বাংলা ইন্টারফেস ও বাংলা ভয়েস রিমাইন্ডার সিস্টেম।
            </p>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <span className="text-3xl mb-3 block">📦</span>
            <h3 className="font-bold text-gray-900 text-lg mb-1">রিফিল ও WhatsApp অর্ডার</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              ওষুধ শেষ হওয়ার ৫ দিন আগেই অ্যালার্ট এবং কাছের ফার্মেসিতে এক ক্লিকে WhatsApp-এ রিফিল অর্ডার।
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-6 text-center text-xs text-gray-400">
        © 2026 ওষুধ রিমাইন্ডার • পরিবার-চালিত ওষুধের দেখাশোনা প্ল্যাটফর্ম
      </footer>
    </div>
  );
}
