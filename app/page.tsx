import Link from "next/link";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import LandingHeroInteractive from "@/components/home/LandingHeroInteractive";
import LandingFAQ from "@/components/home/LandingFAQ";

export default async function HomePage() {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get("authjs.session-token")?.value;
  let isLoggedIn = false;

  if (sessionToken) {
    try {
      const session = await db.session.findUnique({
        where: { sessionToken },
        include: { user: true },
      });
      if (session && session.expires > new Date()) {
        isLoggedIn = true;
      }
    } catch (e) {
      console.error("Session check error on home:", e);
    }
  }

  return (
    <div className="min-h-screen bg-[#FBFDFB] text-gray-900 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* 🌟 Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-emerald-100/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
            <span className="text-3xl filter drop-shadow-sm">💊</span>
            <div>
              <span className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight block leading-tight">
                ওষুধ রিমাইন্ডার
              </span>
              <span className="text-[10px] font-bold text-emerald-700 tracking-wide block uppercase">
                পরিবার-চালিত সুরক্ষা
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-600">
            <a href="#how-it-works" className="hover:text-emerald-700 transition-colors">
              কীভাবে কাজ করে
            </a>
            <a href="#features" className="hover:text-emerald-700 transition-colors">
              ফিচারসমূহ
            </a>
            <a href="#faq" className="hover:text-emerald-700 transition-colors">
              সাধারণ জিজ্ঞাসা
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-extrabold text-sm rounded-2xl shadow-md shadow-emerald-600/20 transition-all active:scale-95 flex items-center gap-2"
              >
                <span>ড্যাশবোর্ড</span>
                <span>→</span>
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2.5 text-gray-700 hover:text-emerald-700 font-extrabold text-sm rounded-xl transition-all"
                >
                  লগইন
                </Link>
                <Link
                  href="/login"
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-extrabold text-sm rounded-2xl shadow-md shadow-emerald-600/20 transition-all active:scale-95"
                >
                  শুরু করুন (ফ্রি)
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 🚀 Hero Section with Ambient Lights & Live Demo */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        {/* Ambient Gradient Background Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-emerald-100/50 via-teal-50/20 to-transparent blur-3xl -z-10 pointer-events-none"></div>
        <div className="absolute top-36 -left-20 w-80 h-80 bg-emerald-200/40 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        <div className="absolute top-48 -right-20 w-80 h-80 bg-teal-200/40 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Compelling Copy & CTA */}
            <div className="lg:col-span-7 text-center lg:text-left">
              {/* Trust Tag */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 border border-emerald-200/70 text-emerald-800 text-xs sm:text-sm font-extrabold rounded-full mb-6 shadow-xs">
                <span className="animate-pulse">🇧🇩</span>
                <span>বাংলাদেশের প্রথম পরিবার-কেন্দ্রিক হেলথকেয়ার PWA</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-6xl font-black text-gray-900 tracking-tight leading-[1.15] mb-6">
                বাবা-মায়ের ওষুধ মিস হলে <br />
                <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 bg-clip-text text-transparent">
                  মুহূর্তেই পরিবারের কাছে অ্যালার্ট
                </span>
              </h1>

              {/* Sub-headline */}
              <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0 mb-8 leading-relaxed font-medium">
                সন্তান অফিসে থাকুন বা প্রবাসে—বাবা-মা সময়মতো ওষুধ খেলেন কিনা তা নিয়ে আর দুশ্চিন্তা নয়। 
                এক ক্লিকে প্রেসক্রিপশন স্ক্যান, স্পষ্ট বাংলা ভয়েস রিমাইন্ডার এবং ওষুধ না খেলে পরিবারের সবার ফোনে স্বয়ংক্রিয় মিসড অ্যালার্ট।
              </p>

              {/* CTA Group */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-10">
                <Link
                  href={isLoggedIn ? "/dashboard" : "/login"}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 hover:from-emerald-700 hover:to-green-800 text-white font-black rounded-2xl text-lg shadow-xl shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
                >
                  <span>{isLoggedIn ? "ড্যাশবোর্ডে প্রবেশ করুন" : "বিনামূল্যে শুরু করুন"}</span>
                  <span className="text-xl">🚀</span>
                </Link>

                <Link
                  href="/prescriptions/review"
                  className="w-full sm:w-auto px-7 py-4 bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 font-extrabold rounded-2xl text-base shadow-xs hover:border-emerald-300 transition-all flex items-center justify-center gap-2.5"
                >
                  <span>📸 প্রেসক্রিপশন স্ক্যান ডেমো</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="flex items-center justify-center lg:justify-start flex-wrap gap-6 text-xs sm:text-sm font-bold text-gray-500">
                <div className="flex items-center gap-1.5 text-emerald-800">
                  <span>✓</span>
                  <span>১০০% ফ্রি সার্ভিস</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-800">
                  <span>✓</span>
                  <span>সহজ বাংলা ভয়েস</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-800">
                  <span>✓</span>
                  <span>প্লে-স্টোর ছাড়াই ১ ক্লিকে ইনস্টল</span>
                </div>
              </div>
            </div>

            {/* Right Column: Live Interactive Device Demo Card */}
            <div className="lg:col-span-5 flex justify-center">
              <LandingHeroInteractive />
            </div>
          </div>
        </div>
      </section>

      {/* 📊 Key Stats Ribbon */}
      <section className="bg-emerald-900 text-white py-12 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-1">
              <p className="text-3xl sm:text-5xl font-black text-emerald-400">৩০ মিনিট</p>
              <p className="text-xs sm:text-sm font-semibold text-emerald-100">সর্বোচ্চ মিসড অ্যালার্ট সময়</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl sm:text-5xl font-black text-emerald-400">৮০px</p>
              <p className="text-xs sm:text-sm font-semibold text-emerald-100">বয়স্কদের উপযোগী সুবিশাল বোতাম</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl sm:text-5xl font-black text-emerald-400">১০০%</p>
              <p className="text-xs sm:text-sm font-semibold text-emerald-100">বাংলা কণ্ঠস্বর ও নির্দেশিকা</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl sm:text-5xl font-black text-emerald-400">০ মেমোরি</p>
              <p className="text-xs sm:text-sm font-semibold text-emerald-100">লাইটওয়েট ইনস্টলযোগ্য PWA</p>
            </div>
          </div>
        </div>
      </section>

      {/* 🛠️ How It Works (৩টি সহজ ধাপ) */}
      <section id="how-it-works" className="py-20 sm:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <span className="text-xs sm:text-sm font-black text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200 uppercase tracking-wider">
            সহজ ৩ ধাপের প্রক্রিয়া
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-gray-900 mt-4 mb-4 tracking-tight">
            কীভাবে আপনার পরিবারকে নিশ্চিন্ত রাখে?
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm sm:text-base mb-16">
            কোনো জটিলতা নেই। মাত্র দুই মিনিটে পুরো পরিবারের ওষুধের সুরক্ষাবলয় তৈরি করে নিন।
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {/* Step 1 */}
            <div className="relative p-8 rounded-3xl bg-emerald-50/40 border border-emerald-100/80 hover:border-emerald-300 transition-all shadow-xs group">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white font-black text-2xl flex items-center justify-center mb-6 shadow-md shadow-emerald-600/20 group-hover:scale-110 transition-transform">
                ১
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">প্রেসক্রিপশন বা ওষুধ যোগ</h3>
              <p className="text-sm text-gray-600 leading-relaxed font-medium">
                ডাক্তারের প্রেসক্রিপশনের ছবি তুলুন—আমাদের AI নিজে থেকেই ওষুধ ও সময় বের করে দেবে। অথবা নিজে নাম ও সময় লিখে ওষুধ যোগ করুন।
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative p-8 rounded-3xl bg-emerald-50/40 border border-emerald-100/80 hover:border-emerald-300 transition-all shadow-xs group">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white font-black text-2xl flex items-center justify-center mb-6 shadow-md shadow-emerald-600/20 group-hover:scale-110 transition-transform">
                ২
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">বাংলা ভয়েসে রিমাইন্ডার</h3>
              <p className="text-sm text-gray-600 leading-relaxed font-medium">
                নির্দিষ্ট সময় হলেই রোগীর ফোনে বড় অক্ষরে অ্যালার্ট বাজবে। বোতামে চাপ দিলে বাংলায় স্পষ্ট করে বলে দেওয়া হবে কখন কোন ওষুধটি খেতে হবে।
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative p-8 rounded-3xl bg-emerald-50/40 border border-emerald-100/80 hover:border-emerald-300 transition-all shadow-xs group">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white font-black text-2xl flex items-center justify-center mb-6 shadow-md shadow-emerald-600/20 group-hover:scale-110 transition-transform">
                ৩
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">পরিবারের কাছে স্বস্তি</h3>
              <p className="text-sm text-gray-600 leading-relaxed font-medium">
                রোগী ওষুধ খেলে সাথে সাথে সন্তানের মোবাইলে কনফার্মেশন পৌঁছে যাবে। আর ৩০ মিনিটে না খেলে লাল মিসড অ্যালার্ট যাবে!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 💡 Feature Showcase Grid */}
      <section id="features" className="py-20 sm:py-28 bg-[#F8FAF8] border-y border-emerald-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <span className="text-xs sm:text-sm font-black text-emerald-700 bg-emerald-100 px-3.5 py-1.5 rounded-full uppercase tracking-wider">
              অত্যাধুনিক সুবিধাসমূহ
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-gray-900 mt-4 mb-4 tracking-tight">
              পরিবারের প্রতিটি সদস্যের স্বাচ্ছন্দ্যের কথা মাথায় রেখে তৈরি
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-sm sm:text-base">
              সাধারণ কোনো অ্যালার্ম অ্যাপ নয়, এটি একটি পূর্ণাঙ্গ পারিবারিক ওষুধের দায়িত্বশীল সঙ্গী।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-7 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <span className="text-4xl mb-4 block">🤖</span>
              <h3 className="text-xl font-black text-gray-900 mb-2">AI প্রেসক্রিপশন স্ক্যানার</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                ডাক্তারের হাতের লেখা বুঝতে না পারলেও সমস্যা নেই। ক্যামেরা দিয়ে ছবি তুললেই এআই প্রেসক্রিপশন অ্যানালাইজ করে ওষুধের তালিকা খসড়া করে দেয়।
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-7 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <span className="text-4xl mb-4 block">👵</span>
              <h3 className="text-xl font-black text-gray-900 mb-2">বয়োজ্যেষ্ঠ-বান্ধব ইন্টারফেস</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                সহজ বাংলা ভাষা, চোখের আরামদায়ক বড় ফন্ট এবং আঙুলের ছোঁয়ায় চাপ দেওয়ার মতো সুবিশাল ৮০px &quot;আমি খেয়েছি&quot; বোতাম।
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-7 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <span className="text-4xl mb-4 block">🔊</span>
              <h3 className="text-xl font-black text-gray-900 mb-2">খাঁটি বাংলা ভয়েস রিডিং</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                মোবাইল বা পিসি যাই হোক না কেন—ক্লিয়ার স্টুডিও-কোয়ালিটি বাংলায় স্বয়ংক্রিয়ভাবে সময়, ওষুধের নাম ও খাওয়ার নিয়ম মুখে বলে দেবে।
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-7 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <span className="text-4xl mb-4 block">👨‍👩‍👧‍👦</span>
              <h3 className="text-xl font-black text-gray-900 mb-2">মাল্টি-কেয়ারগিভার ট্র্যাকিং</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                একই বাবা-মায়ের সুরক্ষায় যুক্ত থাকতে পারেন ছেলে, মেয়ে, ভাই বা বোন সবাই। রোগী ওষুধ খেলে সবার কাছেই রিয়েলটাইমে সবুজ নোটিফিকেশন যাবে।
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-7 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <span className="text-4xl mb-4 block">📦</span>
              <h3 className="text-xl font-black text-gray-900 mb-2">স্মার্ট স্টক ও WhatsApp রিফিল</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                ওষুধ ফুরিয়ে যাওয়ার ৫ দিন আগেই কেয়ারগিভারকে সতর্ক করে এবং ১ ক্লিকে স্থানীয় ফার্মেসিতে WhatsApp-এর মাধ্যমে রিফিল অর্ডার পাঠানো যায়।
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-7 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <span className="text-4xl mb-4 block">⚡</span>
              <h3 className="text-xl font-black text-gray-900 mb-2">রিয়েলটাইম ইনস্ট্যান্ট সিঙ্ক</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                রোগী বা কেয়ারগিভার যে প্রান্ত থেকেই ওষুধ গ্রহণ কনফার্ম করুন না কেন, পেজ রিফ্রেশ ছাড়াই সাথে সাথে অন্য স্ক্রিনে স্ট্যাটাস আপডেট হয়ে যায়।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ❤️ Heartwarming Testimonial / Story Quote */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="text-5xl text-emerald-600 font-serif block mb-4">“</span>
          <p className="text-xl sm:text-2xl font-bold text-gray-800 leading-relaxed mb-6">
            আগে অফিসে বসে সারাক্ষণ টেনশন হতো বাবা প্রেসারের ওষুধ খেয়েছেন কি না। এখন বাবা ওষুধ খেয়ে বোতাম চাপ দিলেই আমার ফোনে নোটিফিকেশন চলে আসে—দিনশেষে এই মানসিক শান্তিটা অমূল্য।
          </p>
          <div className="flex items-center justify-center gap-3">
            <div className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-800 font-extrabold flex items-center justify-center text-lg">
              ম
            </div>
            <div className="text-left">
              <p className="font-extrabold text-gray-900 text-sm">মাহবুবুর রহমান</p>
              <p className="text-xs text-gray-500 font-medium">ঢাকা, বাংলাদেশ</p>
            </div>
          </div>
        </div>
      </section>

      {/* ❓ Frequently Asked Questions */}
      <section id="faq" className="py-20 sm:py-28 bg-[#FBFDFB]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="text-xs sm:text-sm font-black text-emerald-700 bg-emerald-100 px-3.5 py-1.5 rounded-full uppercase tracking-wider">
              সাধারণ প্রশ্ন ও উত্তর
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-gray-900 mt-4 mb-3 tracking-tight">
              আপনার মনে কি কোনো প্রশ্ন আছে?
            </h2>
            <p className="text-gray-500 text-sm sm:text-base">
              অ্যাপটি ব্যবহারের পূর্বে আপনার সাধারণ জিজ্ঞাসাগুলোর পরিষ্কার উত্তর নিচে দেওয়া হলো।
            </p>
          </div>

          <LandingFAQ />
        </div>
      </section>

      {/* 🌟 Final Call to Action (High Conversion) */}
      <section className="py-16 sm:py-24 bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-900 text-white relative overflow-hidden text-center">
        {/* Glow circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <span className="text-4xl sm:text-5xl mb-4 block">👨‍👩‍👧‍👦</span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-6 leading-tight">
            আজই আপনার পরিবারের ওষুধের সুরক্ষাবলয় তৈরি করুন
          </h2>
          <p className="text-emerald-100 text-base sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            বাবা-মায়ের সুস্বাস্থ্য ও আপনার মানসিক শান্তির শুরু হোক আজ থেকেই। কোনো ক্রেডিট কার্ডের প্রয়োজন নেই, সম্পূর্ণ বিনামূল্যে যোগ দিন।
          </p>

          <Link
            href={isLoggedIn ? "/dashboard" : "/login"}
            className="inline-flex items-center gap-3 px-9 py-5 bg-white text-emerald-950 font-black rounded-2xl text-lg sm:text-xl shadow-2xl hover:bg-emerald-50 transition-all hover:scale-105 active:scale-95"
          >
            <span>{isLoggedIn ? "আপনার ড্যাশবোর্ডে যান" : "এখনই অ্যাকাউন্ট খুলুন (ফ্রি)"}</span>
            <span>🚀</span>
          </Link>
        </div>
      </section>

      {/* 📄 Professional Clean Footer */}
      <footer className="bg-white border-t border-gray-100 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💊</span>
            <div>
              <p className="font-black text-gray-900 text-base">ওষুধ রিমাইন্ডার</p>
              <p className="text-xs text-gray-500">পরিবার-চালিত ওষুধের দেখাশোনা প্ল্যাটফর্ম</p>
            </div>
          </div>

          <p className="text-xs text-gray-400 font-medium">
            ভালোবাসায় নির্মিত 🇧🇩 বাংলাদেশে • © {new Date().getFullYear()} সর্বস্বত্ব সংরক্ষিত
          </p>

          <div className="flex items-center gap-5 text-xs font-bold text-gray-500">
            <Link href="/login" className="hover:text-emerald-700 transition-colors">
              লগইন
            </Link>
            <Link href="/prescriptions/review" className="hover:text-emerald-700 transition-colors">
              প্রেসক্রিপশন
            </Link>
            <Link href="/refill" className="hover:text-emerald-700 transition-colors">
              ফার্মেসি রিফিল
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
