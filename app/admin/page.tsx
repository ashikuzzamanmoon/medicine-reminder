"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface AdminStats {
  users: {
    total: number;
    caregivers: number;
    patients: number;
    activeNow: number;
    newLast7Days: number;
  };
  medicines: {
    activeTotal: number;
    dosesTracked: number;
  };
  todayActivity: {
    totalDoses: number;
    takenDoses: number;
    missedDoses: number;
    complianceRate: number;
  };
  pushSubscribers: number;
  recentUsers: {
    id: string;
    name: string;
    phone: string | null;
    role: string;
    mode: string;
    createdAt: string;
  }[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/admin/stats");
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
        }
      } catch (err) {
        console.error("Admin stats fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-16 font-sans">
      {/* Admin Header */}
      <header className="bg-slate-800/80 backdrop-blur border-b border-slate-700 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl text-xl font-black">
              🛡️
            </span>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">সুপার অ্যাডমিন ড্যাশবোর্ড</h1>
              <p className="text-xs text-slate-400">মেডিসিন রিমাইন্ডার সিস্টেম মেট্রিক্স ও ইউজার ট্র্যাকিং</p>
            </div>
          </Link>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            ← মূল অ্যাপে যান
          </Link>
        </div>
      </header>

      {/* Main Stats Grid */}
      <main className="max-w-6xl mx-auto px-4 pt-8 space-y-8">
        <div>
          <h2 className="text-2xl font-black text-white">লাইভ প্ল্যাটফর্ম পরিসংখ্যান</h2>
          <p className="text-sm text-slate-400 mt-1">কতজন সাইনআপ করেছেন, বর্তমান একটিভ ব্যবহারকারী ও অ্যালার্ট স্থিতি</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-slate-800/60 rounded-3xl border border-slate-700 animate-pulse"></div>
            ))}
          </div>
        ) : stats ? (
          <>
            {/* Top Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Total Users */}
              <div className="p-6 bg-slate-800 rounded-3xl border border-slate-700 shadow-xl">
                <div className="flex justify-between items-center text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">মোট ইউজার</span>
                  <span className="text-lg">👥</span>
                </div>
                <div className="text-3xl font-black text-white">{stats.users.total} জন</div>
                <p className="text-xs text-emerald-400 mt-2 font-medium">
                  + {stats.users.newLast7Days} জন নতুন (গত ৭ দিনে)
                </p>
              </div>

              {/* Card 2: Active Sessions */}
              <div className="p-6 bg-slate-800 rounded-3xl border border-slate-700 shadow-xl">
                <div className="flex justify-between items-center text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">একটিভ সেশন</span>
                  <span className="text-lg">⚡</span>
                </div>
                <div className="text-3xl font-black text-emerald-400 flex items-center gap-2">
                  <span>{stats.users.activeNow}</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                </div>
                <p className="text-xs text-slate-400 mt-2 font-medium">বর্তমানে লগইন অবস্থায় আছেন</p>
              </div>

              {/* Card 3: Caregivers & Patients */}
              <div className="p-6 bg-slate-800 rounded-3xl border border-slate-700 shadow-xl">
                <div className="flex justify-between items-center text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">পরিবার বনাম রোগী</span>
                  <span className="text-lg">👨‍👩‍👧</span>
                </div>
                <div className="text-xl font-extrabold text-white">
                  {stats.users.caregivers} <span className="text-xs font-normal text-slate-400">কেয়ারগিভার</span> / {stats.users.patients} <span className="text-xs font-normal text-slate-400">রোগী</span>
                </div>
                <p className="text-xs text-slate-400 mt-2 font-medium">
                  সক্রিয় ওষুধ: {stats.medicines.activeTotal}টি
                </p>
              </div>

              {/* Card 4: Push Subscribers */}
              <div className="p-6 bg-slate-800 rounded-3xl border border-slate-700 shadow-xl">
                <div className="flex justify-between items-center text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">পুশ নোটিফিকেশন গ্রাহক</span>
                  <span className="text-lg">🔔</span>
                </div>
                <div className="text-3xl font-black text-purple-400">
                  {stats.pushSubscribers}
                </div>
                <p className="text-xs text-slate-400 mt-2 font-medium">ডিভাইসে অ্যালার্ট সক্রিয় আছে</p>
              </div>
            </div>

            {/* Today Dose Adherence Metrics */}
            <div className="p-6 sm:p-8 bg-slate-800 rounded-3xl border border-slate-700 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span>📊 আজকের সামগ্রিক মেডিসিন কমপ্লায়েন্স</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
                <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-700/60">
                  <p className="text-xs text-slate-400">মোট শিডিউলড ডোজ</p>
                  <p className="text-2xl font-black text-white mt-1">{stats.todayActivity.totalDoses}টি</p>
                </div>
                <div className="p-4 bg-emerald-950/40 border border-emerald-800/40 rounded-2xl">
                  <p className="text-xs text-emerald-300">খেয়েছে ✅</p>
                  <p className="text-2xl font-black text-emerald-400 mt-1">{stats.todayActivity.takenDoses}টি</p>
                </div>
                <div className="p-4 bg-red-950/40 border border-red-800/40 rounded-2xl">
                  <p className="text-xs text-red-300">মিসড ডোজ ❌</p>
                  <p className="text-2xl font-black text-red-400 mt-1">{stats.todayActivity.missedDoses}টি</p>
                </div>
                <div className="p-4 bg-purple-950/40 border border-purple-800/40 rounded-2xl">
                  <p className="text-xs text-purple-300">গড় সাফল্য হার</p>
                  <p className="text-2xl font-black text-purple-400 mt-1">{stats.todayActivity.complianceRate}%</p>
                </div>
              </div>
            </div>

            {/* Recent Registrations Table */}
            <div className="bg-slate-800 rounded-3xl border border-slate-700 shadow-xl overflow-hidden p-6 sm:p-8">
              <h3 className="text-lg font-bold text-white mb-4">সর্বশেষ নিবন্ধিত ব্যবহারকারীগণ</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-900/50 text-xs text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="p-3 rounded-l-xl">নাম</th>
                      <th className="p-3">মোবাইল</th>
                      <th className="p-3">ভূমিকা</th>
                      <th className="p-3">মোড</th>
                      <th className="p-3 rounded-r-xl">যোগদানের তারিখ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {stats.recentUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-700/30 transition-colors">
                        <td className="p-3 font-bold text-white">{u.name}</td>
                        <td className="p-3 text-slate-400">{u.phone || "—"}</td>
                        <td className="p-3">
                          <span
                            className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                              u.role === "CAREGIVER"
                                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3 text-xs font-semibold text-slate-400">{u.mode}</td>
                        <td className="p-3 text-xs text-slate-400">
                          {new Date(u.createdAt).toLocaleDateString("bn-BD")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}

