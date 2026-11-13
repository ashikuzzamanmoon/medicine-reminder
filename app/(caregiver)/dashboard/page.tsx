"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PatientStatusCard from "@/components/caregiver/PatientStatusCard";

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

  return (
    <div className="min-h-screen bg-gray-50/70 pb-16">
      {/* Top Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💊</span>
            <span className="text-xl font-black text-gray-900 tracking-tight">ওষুধ রিমাইন্ডার</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/patients/new"
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold text-sm rounded-xl transition-all shadow-sm"
            >
              + নতুন রোগী যোগ
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 pt-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">পারিবারিক ড্যাশবোর্ড</h1>
          <p className="text-sm text-gray-500 mt-1">
            পরিবারের সদস্যদের আজকের ওষুধের অবস্থা, অগ্রগতি ও মিসড অ্যালার্ট ট্র্যাকিং
          </p>
        </div>

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

