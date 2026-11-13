"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PatientForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    relation: "বাবা",
    phone: "",
  });

  const relations = ["আমি নিজে", "বাবা", "মা", "স্বামী", "স্ত্রী", "ছেলে", "মেয়ে", "ভাই", "বোন", "দাদা", "দাদী", "নানা", "নানী", "অন্যান্য"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          age: formData.age ? parseInt(formData.age, 10) : undefined,
          relation: formData.relation,
          phone: formData.phone || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "রোগী যোগ করতে ব্যর্থ হয়েছে");
      }

      setSuccess("রোগীর প্রোফাইল সফলভাবে তৈরি হয়েছে! ওষুধের তালিকায় নিয়ে যাওয়া হচ্ছে...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("অপ্রত্যাশিত ত্রুটি ঘটেছে");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 max-w-xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">নতুন রোগীর প্রোফাইল তৈরি করুন</h2>
        <p className="text-sm text-gray-500">পরিবারের যে সদস্যের ওষুধ দেখাশোনা করবেন তার তথ্য দিন</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-medium">
          {success}
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          রোগীর পুরো নাম <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          placeholder="যেমন: মোঃ রফিকুল ইসলাম"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            আপনার সাথে সম্পর্ক <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.relation}
            onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all bg-white"
          >
            {relations.map((rel) => (
              <option key={rel} value={rel}>
                {rel}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            বয়স (বছর)
          </label>
          <input
            type="number"
            min="1"
            max="120"
            placeholder="যেমন: ৬৫"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          রোগীর নিজস্ব ফোন নম্বর (ঐচ্ছিক)
        </label>
        <input
          type="tel"
          placeholder="যেমন: 017xxxxxxxx (যদি রোগী নিজে ব্যবহার করেন)"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
        />
        <p className="text-xs text-gray-500 mt-1">রোগীর ফোনে রিমাইন্ডার পাঠানোর জন্য প্রয়োজন হতে পারে</p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-lg transition-colors flex items-center justify-center disabled:opacity-50"
      >
        {loading ? "সংরক্ষণ করা হচ্ছে..." : "রোগী যুক্ত করুন ও পরবর্তী ধাপে যান"}
      </button>
    </form>
  );
}

