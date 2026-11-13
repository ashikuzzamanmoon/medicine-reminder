import PrescriptionReview from "@/components/caregiver/PrescriptionReview";

export default function PrescriptionReviewPage() {
  return (
    <main className="min-h-screen py-10 px-4 max-w-4xl mx-auto">
      <div className="mb-6">
        <a href="/dashboard" className="text-sm font-semibold text-green-700 hover:underline">
          ← ড্যাশবোর্ডে ফিরে যান
        </a>
      </div>
      <PrescriptionReview />
    </main>
  );
}
