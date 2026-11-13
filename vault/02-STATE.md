# 02 — Live State & Checkpoint Tracker

> **প্রজেক্ট:** Medicine Reminder MVP v1.0
> **শেষ আপডেট:** 2026-11-12

---

## বর্তমান অবস্থা

| ক্ষেত্র | মান |
|---|---|
| **Phase** | Phase 4: Missed Dose Alert |
| **Last Completed Step** | Step 8 — Patient Reminder Screen (Big Buttons & Bengali TTS) ✅ |
| **Active Step** | Step 9: Caregiver Alert (Missed Dose) |
| **Next Step** | Step 10: Caregiver ড্যাশবোর্ড |
| **Active Blockers** | — |

---

## Completed Steps Log

| Step | বিবরণ | তারিখ | Verification |
|---|---|---|---|
| Step 1 | Next.js 14 + Prisma v5 + Neon DB সেটআপ | 2026-11-13 | tsc ✅ validate ✅ db push ✅ build ✅ |
| Step 2 | NextAuth.js v5 + Google OAuth + Phone OTP Engine | 2026-11-13 | tsc ✅ build ✅ API endpoints generated ✅ |
| Step 3 | PWA Manifest, Service Worker & Web Push VAPID Integration | 2026-11-13 | tsc ✅ build ✅ sw.js/manifest ✅ |
| Step 4 | Patient Creation Form, Zod Schema & /api/patients API | 2026-11-13 | tsc ✅ build ✅ /patients/new live ✅ |
| Step 5 | Medicine Entry Form with Dynamic Multi-schedules & Relational API | 2026-11-13 | tsc ✅ build ✅ /medicines/new live ✅ |
| Step 6 | Daily Dose Generation Engine & Vercel Cron Endpoint | 2026-11-13 | tsc ✅ build ✅ /api/cron/generate-doses live ✅ |
| Step 7 | Patient Push Notification Cron Engine & Lazy VAPID Dispatcher | 2026-11-13 | tsc ✅ build ✅ /api/cron/send-reminders live ✅ |
| Step 8 | Accessible Patient Reminder UI (80px Buttons, Bengali TTS & Confirmation API) | 2026-11-13 | tsc ✅ build ✅ /reminder dynamic page live ✅ |

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
