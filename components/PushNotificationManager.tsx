"use client";

import { useEffect, useState } from "react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushNotificationManager() {
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator && "Notification" in window) {
      setSupported(true);
      const perm = Notification.permission;
      setPermission(perm);
      if (perm === "denied") {
        setMessage("⚠️ ব্রাউজার সেটিংসে নোটিফিকেশন ব্লক (Denied) করা আছে। ব্রাউজারের সাইট সেটিংসে গিয়ে নোটিফিকেশন 'Allow' করুন।");
      }

      // সার্ভিস ওয়ার্কার রেজিস্টার করা এবং সাবস্ক্রিপশন চেক করা
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((reg) => {
          return reg.pushManager.getSubscription();
        })
        .then((sub) => {
          if (sub) {
            setSubscribed(true);
          }
        })
        .catch((err) => {
          console.warn("SW check warning:", err);
        });
    }
  }, []);

  async function handleEnablePush() {
    setLoading(true);
    setMessage(null);
    try {
      if (!("serviceWorker" in navigator) || !("Notification" in window)) {
        throw new Error("আপনার ব্রাউজারে পুশ নোটিফিকেশন সাপোর্ট করে না");
      }

      // ১. নোটিফিকেশন পারমিশন চাওয়া
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== "granted") {
        setMessage("⚠️ ব্রাউজার থেকে নোটিফিকেশন পারমিশন দেওয়া হয়নি। ব্রাউজার সেটিংসে গিয়ে Allow করুন।");
        setLoading(false);
        return;
      }

      // ২. সার্ভিস ওয়ার্কার রেজিস্ট্রেশন নিশ্চিত করা
      const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      await navigator.serviceWorker.ready;

      // ৩. VAPID পাবলিক কি আনা
      const vapidRes = await fetch("/api/notifications/vapid-key");
      const { publicKey } = await vapidRes.json();

      if (!publicKey) {
        throw new Error("সার্ভার থেকে VAPID কি পাওয়া যায়নি");
      }

      // ৪. সাবস্ক্রিপশন তৈরি বা রিট্রিভ করা
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });
      }

      // ৫. সার্ভারে সেভ করা
      const subJSON = sub.toJSON();
      const saveRes = await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: subJSON.endpoint,
          keys: subJSON.keys,
        }),
      });

      if (saveRes.ok) {
        setSubscribed(true);
        setMessage("✅ নোটিফিকেশন সফলভাবে চালু হয়েছে! নির্ধারিত সময়ে অ্যালার্ট পাবেন।");
      } else {
        const errorData = await saveRes.json();
        setMessage(`❌ সাবস্ক্রিপশন সেভ হয়নি: ${errorData.error || "সার্ভার এরর"}`);
      }
    } catch (err) {
      console.error("Push subscribe error:", err);
      const errMsg = err instanceof Error ? err.message : "নোটিফিকেশন সক্রিয় করতে সমস্যা হয়েছে";
      setMessage(`❌ ${errMsg}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleSendTest() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/notifications/test", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setMessage("🎉 টেস্ট নোটিফিকেশন পাঠানো হয়েছে! ফোনের নোটিফিকেশন বার চেক করুন।");
      } else {
        setMessage(`⚠️ ${data.error || "নোটিফিকেশন পাঠাতে সমস্যা হয়েছে"}`);
      }
    } catch (err) {
      console.error("Test notification error:", err);
      setMessage("❌ টেস্ট পাঠাতে সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  }

  if (!supported) return null;

  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="text-2xl mt-0.5">🔔</span>
          <div>
            <h3 className="font-bold text-gray-900 text-sm sm:text-base">
              {subscribed ? "ফোনে নোটিফিকেশন সক্রিয় আছে" : "ফোনে নোটিফিকেশন চালু করুন"}
            </h3>
            <p className="text-xs text-gray-600 mt-0.5">
              {subscribed
                ? "ওষুধ খাওয়ার সময় এবং মিসড অ্যালার্ট স্বয়ংক্রিয়ভাবে ফোনে নোটিফিকেশন পাবেন।"
                : "সঠিক সময়ে ওষুধের রিমাইন্ডার ও অ্যালার্ট পেতে এই ডিভাইসে নোটিফিকেশন এলাও করুন।"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          {permission === "denied" ? (
            <span className="px-3 py-1.5 bg-red-100 text-red-700 font-bold text-xs rounded-xl">
              পারমিশন ব্লক করা
            </span>
          ) : !subscribed ? (
            <button
              onClick={handleEnablePush}
              disabled={loading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              {loading ? "চালু হচ্ছে..." : "নোটিফিকেশন চালু করুন 🔔"}
            </button>
          ) : (
            <button
              onClick={handleSendTest}
              disabled={loading}
              className="px-3 py-1.5 bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl transition-all shadow-xs disabled:opacity-50"
            >
              {loading ? "পাঠানো হচ্ছে..." : "টেস্ট নোটিফিকেশন পাঠান 📲"}
            </button>
          )}
        </div>
      </div>

      {message && (
        <div className="mt-3 text-xs font-medium text-emerald-900 bg-white/80 rounded-lg p-2 border border-emerald-200">
          {message}
        </div>
      )}
    </div>
  );
}
