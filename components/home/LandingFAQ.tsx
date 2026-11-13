"use client";

import { useState } from "react";

const faqs = [
  {
    q: "আমার বয়স্ক বাবা-মা কি এটি সহজে ব্যবহার করতে পারবেন?",
    a: "অবশ্যই! অ্যাপটির রোগীর ইন্টারফেস বিশেষভাবে বয়োজ্যেষ্ঠদের কথা ভেবে তৈরি করা হয়েছে। এতে কোনো জটিল মেনু বা ইংরেজি নেই—রয়েছে সুবিশাল স্পষ্ট বাংলা ফন্ট, ৮০px বড় স্পর্শযোগ্য 'খেয়েছি' বোতাম এবং ১ ক্লিকে স্পষ্ট বাংলা কণ্ঠস্বরে ওষুধ খাওয়ার সময় ও পরিমাণ শোনার সুবিধা।",
  },
  {
    q: "রোগী সময়মতো ওষুধ না খেলে কী হবে?",
    a: "নির্ধারিত সময়ের ৩০ মিনিটের মধ্যে যদি রোগী 'আমি খেয়েছি' বোতামে চাপ না দেন, সিস্টেম স্বয়ংক্রিয়ভাবে পরিবারের দায়িত্বপ্রাপ্ত কেয়ারগিভার বা সন্তানদের ফোনে উচ্চ-অগ্রাধিকারযুক্ত লাল 'মিসড অ্যালার্ট' পাঠাবে, যেন আপনারা ফোন দিয়ে বাবাকে ওষুধ খাওয়ার কথা মনে করিয়ে দিতে পারেন।",
  },
  {
    q: "একাধিক সন্তান বা ভাই-বোন কি একসাথে এক অভিভাবককে দেখাশোনা করতে পারে?",
    a: "হ্যাঁ! একই রোগীর অ্যাকাউন্টের সাথে পরিবারের একাধিক সদস্য (যেমন: ছেলে, মেয়ে, পুত্রবধূ) যুক্ত হতে পারেন। বাবা ওষুধ খেলে সবার কাছেই কনফার্মেশন যাবে এবং যেকোনো একজন ওষুধ আপডেট করতে পারবেন।",
  },
  {
    q: "ডাক্তারের হাতের লেখা প্রেসক্রিপশন কি এটি পড়তে পারে?",
    a: "হ্যাঁ, আমাদের প্ল্যাটফর্মে রয়েছে আধুনিক AI প্রেসক্রিপশন অ্যানালাইজার। মোবাইল ক্যামেরা দিয়ে প্রেসক্রিপশনের একটি ছবি তুললেই কৃত্রিম বুদ্ধিমত্তা স্বয়ংক্রিয়ভাবে ওষুধের নাম, ডোজ এবং খাওয়ার সময়সূচি খসড়া তৈরি করে দেয়। আপনি শুধু একবার যাচাই করে সেভ করবেন।",
  },
  {
    q: "এটি ব্যবহার করতে কি কোনো খরচ আছে বা কোনো অ্যাপ ডাউনলোড করতে হবে?",
    a: "সম্পূর্ণ বিনামূল্যে! এটি একটি প্রগ্রেসিভ ওয়েব অ্যাপ (PWA), যার মানে গুগল প্লে স্টোরের ঝামেলা ছাড়াই সরাসরি ব্রাউজার থেকে মোবাইলের হোমস্ক্রিনে ১ সেকেন্ডে ইনস্টল করে নেওয়া যায় এবং মেমোরিও নষ্ট হয় না।",
  },
];

export default function LandingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-3">
      {faqs.map((faq, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden transition-all"
          >
            <button
              type="button"
              onClick={() => toggle(idx)}
              className="w-full p-5 text-left font-bold text-gray-900 flex items-center justify-between gap-4 hover:bg-emerald-50/40 transition-colors"
            >
              <span className="text-base sm:text-lg">{faq.q}</span>
              <span
                className={`w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg shrink-0 transition-transform ${
                  isOpen ? "rotate-180 bg-emerald-600 text-white" : ""
                }`}
              >
                ↓
              </span>
            </button>
            {isOpen && (
              <div className="px-5 pb-5 text-sm sm:text-base text-gray-600 leading-relaxed border-t border-gray-50 pt-3">
                {faq.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
