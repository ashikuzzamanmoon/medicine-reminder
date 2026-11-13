import Link from "next/link";
import ReminderCard from "@/components/patient/ReminderCard";

export const dynamic = "force-dynamic";

export default function ReminderPage({
  searchParams,
}: {
  searchParams: { doseId?: string };
}) {
  const doseId = searchParams.doseId || "";

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col py-6 px-4 sm:px-6">
      {/* Top Navigation */}
      <div className="max-w-xl mx-auto w-full mb-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm sm:text-base font-bold text-gray-700 bg-white px-4 py-2.5 rounded-2xl shadow-xs border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <span>←</span>
          <span>ড্যাশবোর্ডে ফিরে যান</span>
        </Link>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <ReminderCard doseId={doseId} />
      </div>
    </main>
  );
}
