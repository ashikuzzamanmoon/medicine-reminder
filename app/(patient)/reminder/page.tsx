import ReminderCard from "@/components/patient/ReminderCard";

export default function ReminderPage({
  searchParams,
}: {
  searchParams: { doseId?: string };
}) {
  const doseId = searchParams.doseId || "";

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col justify-center py-8 px-4 sm:px-6">
      <ReminderCard doseId={doseId} />
    </main>
  );
}
