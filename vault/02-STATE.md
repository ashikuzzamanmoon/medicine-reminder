# 02 — Live State & Checkpoint Tracker

> **প্রজেক্ট:** Medicine Reminder MVP v1.0
> **শেষ আপডেট:** 2026-11-12

---

## বর্তমান অবস্থা

| ক্ষেত্র | মান |
|---|---|
| **Phase** | Phase 1: Project Foundation |
| **Last Completed Step** | Step 2 — NextAuth.js + Phone OTP সেটআপ ✅ |
| **Active Step** | Step 3: PWA + Web Push VAPID |
| **Next Step** | Step 4: Patient প্রোফাইল তৈরির UI ও API |
| **Active Blockers** | — |

---

## Completed Steps Log

| Step | বিবরণ | তারিখ | Verification |
|---|---|---|---|
| Step 1 | Next.js 14 + Prisma v5 + Neon DB সেটআপ | 2026-11-13 | tsc ✅ validate ✅ db push ✅ build ✅ |
| Step 2 | NextAuth.js v5 + Google OAuth + Phone OTP Engine | 2026-11-13 | tsc ✅ build ✅ API endpoints generated ✅ |

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
