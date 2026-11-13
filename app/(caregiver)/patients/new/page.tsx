import PatientForm from "@/components/caregiver/PatientForm";

export default function NewPatientPage() {
  return (
    <main className="min-h-screen py-10 px-4 max-w-4xl mx-auto">
      <div className="mb-8">
        <a href="/dashboard" className="text-sm font-medium text-green-700 hover:underline flex items-center gap-1 mb-4">
          ← ড্যাশবোর্ডে ফিরে যান
        </a>
      </div>
      <PatientForm />
    </main>
  );
}
