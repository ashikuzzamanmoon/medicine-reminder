/**
 * ডিভাইস-নিরপেক্ষ বাংলা ভয়েস ইউটিলিটি
 * মোবাইল এবং উইন্ডোজ পিসি উভয়ের জন্য পরিষ্কার বাংলা উচ্চারণ নিশ্চিত করে।
 */

let activeAudio: HTMLAudioElement | null = null;

export function speakBangla(
  text: string,
  callbacks?: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: () => void;
  }
) {
  if (typeof window === "undefined" || !text) return;

  // পূর্ববর্তী অডিও বা স্পিচ বন্ধ করা
  if ("speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }

  if (activeAudio) {
    activeAudio.pause();
    activeAudio.currentTime = 0;
    activeAudio = null;
  }

  callbacks?.onStart?.();

  // ১. প্রথমে ব্রাউজারে দেশীয় খাঁটি বাংলা ভয়েস আছে কিনা চেক করা (সাধারণত মোবাইলে থাকে)
  if ("speechSynthesis" in window) {
    const voices = window.speechSynthesis.getVoices();
    const bnVoice = voices.find(
      (v) =>
        v.lang === "bn-BD" ||
        v.lang === "bn-IN" ||
        v.lang.toLowerCase().startsWith("bn") ||
        v.name.toLowerCase().includes("bangla") ||
        v.name.toLowerCase().includes("bengali")
    );

    // যদি খাঁটি বাংলা ভয়েস পাওয়া যায়, তবেই SpeechSynthesis ব্যবহার করবে
    if (bnVoice) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = bnVoice;
      utterance.lang = bnVoice.lang;
      utterance.rate = 0.9;
      utterance.onend = () => callbacks?.onEnd?.();
      utterance.onerror = () => callbacks?.onError?.();
      window.speechSynthesis.speak(utterance);
      return;
    }
  }

  // ২. উইন্ডোজ পিসি বা ডিভাইসে খাঁটি বাংলা ভয়েস না থাকলে হাই-কোয়ালিটি অডিও ফলব্যাক
  try {
    const audioUrl = `/api/tts?text=${encodeURIComponent(text)}`;
    const audio = new Audio(audioUrl);
    activeAudio = audio;

    audio.onended = () => {
      activeAudio = null;
      callbacks?.onEnd?.();
    };

    audio.onerror = () => {
      activeAudio = null;
      callbacks?.onError?.();
    };

    audio.play().catch((err) => {
      console.warn("Audio play failed:", err);
      callbacks?.onError?.();
    });
  } catch (err) {
    console.error("speakBangla error:", err);
    callbacks?.onError?.();
  }
}

