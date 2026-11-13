"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PatientStatusCard from "@/components/caregiver/PatientStatusCard";
import PushNotificationManager from "@/components/PushNotificationManager";

interface PatientListItem {
  id: string;
  name: string;
  relation: string;
  phone: string | null;
  age: number | null;
}

export default function CaregiverDashboardPage() {
  const [patients, setPatients] = useState<PatientListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPatients() {
      try {
        const res = await fetch("/api/patients");
        const data = await res.json();
        if (data.patients) {
          setPatients(data.patients);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPatients();
  }, []);

  const handleLogout = async () => {
    if (confirm("আপনি কি নিশ্চিত যে অ্যাকাউন্ট থেকে লগআউট করতে চান?")) {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/70 pb-16">
      {/* Top Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 hover:opacity-80 transition-opacity">
            <span className="text-xl sm:text-2xl">💊</span>
            <span className="text-base sm:text-xl font-black text-gray-900 tracking-tight">ওষুধ রিমাইন্ডার</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/patients/new"
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-green-600 hover:bg-green-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm whitespace-nowrap"
            >
              + নতুন রোগী যোগ
            </Link>
            <button
              onClick={handleLogout}
              className="px-2.5 py-1.5 sm:px-3 sm:py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs sm:text-sm rounded-xl transition-all whitespace-nowrap"
              title="লগআউট করুন"
            >
              লগআউট 🚪
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-3 sm:px-4 pt-6 sm:pt-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">পারিবারিক ড্যাশবোর্ড</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            পরিবারের সদস্যদের আজকের ওষুধের অবস্থা, অগ্রগতি ও মিসড অ্যালার্ট ট্র্যাকিং
          </p>
        </div>

        {/* Push Notification Manager */}
        <PushNotificationManager />

        {loading ? (
          <div className="space-y-6">
            <div className="h-64 bg-white rounded-3xl border border-gray-100 animate-pulse"></div>
          </div>
        ) : patients.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 p-8 max-w-xl mx-auto">
            <span className="text-5xl mb-4 block">👨‍👩‍👧</span>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">কোনো রোগীর প্রোফাইল নেই</h3>
            <p className="text-sm text-gray-500 mb-6">
              আপনার বাবা-মা অথবা পরিবারের অন্য কোনো সদস্যকে যোগ করে ওষুধের সময়সূচি নির্ধারণ করুন।
            </p>
            <Link
              href="/patients/new"
              className="inline-block px-6 py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-base transition-colors shadow-sm"
            >
              প্রথম রোগী যোগ করুন
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {patients.map((patient) => (
              <PatientStatusCard
                key={patient.id}
                patientId={patient.id}
                relation={patient.relation}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

