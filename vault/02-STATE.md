# 02 — Live State & Checkpoint Tracker

> **প্রজেক্ট:** Medicine Reminder MVP v1.0
> **শেষ আপডেট:** 2026-11-12

---

## বর্তমান অবস্থা

| ক্ষেত্র | মান |
|---|---|
| **Phase** | Planning — Vault লক করা হচ্ছে |
| **Last Completed Step** | — (শুরু হয়নি) |
| **Active Step** | Vault 01–06 লেখা ও লক করা |
| **Next Step** | Step 1: Next.js প্রজেক্ট ইনিশিয়ালাইজ ও Prisma সেটআপ |
| **Active Blockers** | — |

---

## Completed Steps Log

| Step | বিবরণ | তারিখ | Verification |
|---|---|---|---|
| — | — | — | — |

---

## অ্যাপের State Machine

```
[Unauthenticated]
     ↓ OTP / Google Login
[Authenticated]
     ↓ প্রথমবার লগইন
[Onboarding: Self নাকি Family?]
     ├── Self Mode
     │      ↓
     │   [Patient Dashboard — নিজের ওষুধ]
     └── Family Mode
            ↓
         [Caregiver Dashboard]
              ↓ Patient যোগ করা
         [Patient Setup]
              ↓ ওষুধ যোগ করা
         [Medicine Setup: হাতে / প্রেসক্রিপশন ছবি]
              ↓ সময়সূচি লক
         [Active Monitoring]
              ↓ নির্ধারিত সময়
         [Reminder Sent → Patient Confirms]
              ├── ✅ Taken → Record + Caregiver notified (optional)
              ├── ⏰ Snooze → 30 min পরে আবার
              └── ❌ Missed
                     ↓ +30 min
                  [Caregiver Alert 1]
                     ↓ +60 min
                  [Caregiver Alert 2 (Escalation)]
```

---

## Active Blockers
_কোনো blocker নেই।_
