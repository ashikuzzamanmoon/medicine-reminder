# 06 — Atomic Execution Plan

> **প্রজেক্ট:** Medicine Reminder MVP v1.0
> **নিয়ম:** প্রতিটা Step-এর Verification Gate পাস না হলে পরের Step-এ যাওয়া নিষিদ্ধ।

---

## Phase 1: Project Foundation

### Step 1: Next.js প্রজেক্ট ইনিশিয়ালাইজ ও Prisma সেটআপ
- [x] **Target Files:** `package.json`, `tsconfig.json`, `prisma/schema.prisma`, `.env.local`
- [x] **Vault Refs:** `04-STACK.md`, `05-SCHEMA.md`
- [x] **কাজ:**
  - `npx create-next-app@latest medicine-reminder --typescript --tailwind --app --src-dir=false`
  - Prisma install ও `schema.prisma` পূর্ণ schema দিয়ে লেখা (05-SCHEMA থেকে)
  - `.env.local` তৈরি (placeholder values)
  - Neon DB কানেক্ট ও `npx prisma db push`
- [x] **Verification Gate:**
  ```bash
  npx tsc --noEmit      # ✅ 0 errors
  npx prisma validate   # ✅ Schema valid
  npx prisma db push    # ✅ Tables created on Neon
  npm run build         # ✅ Build succeeded
  ```

---

### Step 2: NextAuth.js সেটআপ (Google OAuth + Phone OTP ফাউন্ডেশন)
- [x] **Target Files:** `app/api/auth/[...nextauth]/route.ts`, `auth.ts`, `lib/auth-schema.ts`, `app/api/auth/send-otp/route.ts`, `app/api/auth/verify-otp/route.ts`
- [x] **Vault Refs:** `04-STACK.md`, `05-SCHEMA.md` (Account, Session, VerificationToken)
- [x] **কাজ:**
  - NextAuth.js v5 beta ও @auth/prisma-adapter ইনস্টল
  - Google Provider ও Database Session স্ট্র্যাটেজি কনফিগার
  - Custom Phone OTP flow: `send-otp` (টোকেন জেনারেশন ও মেয়াদ) এবং `verify-otp` (টোকেন ম্যাচিং, ইউজার ক্রিয়েশন ও সেশন কুকি)
  - Zod দিয়ে ফোন নম্বর ও ওটিপি ভ্যালিডেশন
- [x] **Verification Gate:**
  ```bash
  npx tsc --noEmit   # ✅ 0 errors
  npm run build      # ✅ Route compilation succeeded (API routes live)
  ```

---

### Step 3: PWA + Web Push VAPID সেটআপ
- [x] **Target Files:** `public/manifest.json`, `public/sw.js` (Service Worker), `lib/push.ts`, `app/api/notifications/subscribe/route.ts`, `app/layout.tsx`
- [x] **Vault Refs:** `04-STACK.md`, `03-TOKENS.md` (রঙ, app name)
- [x] **কাজ:**
  - PWA manifest (`manifest.json`) তৈরি: বাংলা নাম ("ওষুধ রিমাইন্ডার"), থিম কালার `#16A34A`, standalone ডিসপ্লে মোড
  - সার্ভিস ওয়ার্কার (`public/sw.js`): পুশ ইভেন্ট হ্যান্ডলার, অ্যাকশন বাটন ("খেয়েছি ✅", "পরে খাবো ⏰"), ভাইব্রেশন প্যাটার্ন ও উইন্ডো ফোকাস
  - VAPID কি পেয়ার জেনারেট করে `.env.local`-এ সেট করা
  - `lib/push.ts`: Web Push API হেলপার ফাংশন (`sendPushNotification`)
  - পুশ সাবস্ক্রিপশন ডাটাবেসে সংরক্ষণ করার API (`/api/notifications/subscribe`)
- [x] **Verification Gate:**
  ```bash
  npx tsc --noEmit     # ✅ 0 errors
  npm run build        # ✅ PWA routes & static optimization successful
  ```

---

## Phase 2: Core Data & Auth UI

### Step 4: Patient প্রোফাইল তৈরির UI ও API
- [x] **Target Files:** `app/(caregiver)/patients/new/page.tsx`, `components/caregiver/PatientForm.tsx`, `app/api/patients/route.ts`, `lib/patient-schema.ts` (CreatePatientProfileSchema)
- [x] **Vault Refs:** `03-TOKENS.md` (রঙ, ফন্ট), `05-SCHEMA.md` (PatientProfile), `01-PRD.md` (ব্যবহারকারীর ফ্লো)
- [x] **কাজ:**
  - Patient যোগ করার রেসপন্সিভ ফর্ম (নাম, বয়স, সম্পর্ক ড্রপডাউন, ফোন নম্বর)
  - Zod validation স্কিমা (`lib/patient-schema.ts`)
  - GET ও POST `/api/patients` হ্যান্ডলার: ইউজার ভ্যালিডেশন, PatientProfile তৈরি ও CaregiverPatient রিলেশনশিপ লিংক
- [x] **Verification Gate:**
  ```bash
  npx tsc --noEmit   # ✅ 0 errors
  npm run build      # ✅ /patients/new & /api/patients compiled successfully
  ```

---

### Step 5: ওষুধ যোগ করার UI ও API (হাতে এন্ট্রি)
- [x] **Target Files:** `app/(caregiver)/medicines/new/page.tsx`, `components/caregiver/MedicineForm.tsx`, `app/api/medicines/route.ts`, `lib/medicine-schema.ts`
- [x] **Vault Refs:** `03-TOKENS.md`, `05-SCHEMA.md` (Medicine, Schedule), `01-PRD.md` (৩.২)
- [x] **কাজ:**
  - ওষুধের ফর্ম: নাম, ডোজ, খাবারের সাথে সময় (আগে/পরে), স্টক সংখ্যা ও ডাইনামিক একাধিক সময়সূচি (সকাল/দুপুর/রাত)
  - Zod validation স্কিমা (`lib/medicine-schema.ts`)
  - GET ও POST `/api/medicines` রুট: ট্রানজেকশনে Medicine এবং Schedules রিলেশনাল ডাটা সেভ
- [x] **Verification Gate:**
  ```bash
  npx tsc --noEmit   # ✅ 0 errors
  npm run build      # ✅ /medicines/new & /api/medicines routes live
  ```

---

## Phase 3: Reminder Engine

### Step 6: Dose Generation Cron Job
- [x] **Target Files:** `app/api/cron/generate-doses/route.ts`, `lib/scheduler.ts`
- [x] **Vault Refs:** `05-SCHEMA.md` (Dose, Schedule), `03-TOKENS.md` (GRACE_PERIOD_MINUTES)
- [x] **কাজ:**
  - `generateDosesForDate`: সক্রিয় শিডিউলগুলো খুঁজে নির্দিষ্ট দিনের জন্য Dose রো তৈরি করা
  - ডুপ্লিকেট চেকিং মেকানিজম (একই দিনে যাতে একাধিকবার একই ডোজ জেনারেট না হয়)
  - `/api/cron/generate-doses` ব্যাকগ্রাউন্ড ক্রন এন্ডপয়েন্ট হ্যান্ডলার
- [x] **Verification Gate:**
  ```bash
  npx tsc --noEmit   # ✅ 0 errors
  npm run build      # ✅ /api/cron/generate-doses compiled successfully
  ```

---

### Step 7: Patient-এর Reminder Push পাঠানো
- [x] **Target Files:** `app/api/cron/send-reminders/route.ts`, `lib/push.ts`
- [x] **Vault Refs:** `05-SCHEMA.md` (Dose, PushSubscription), `03-TOKENS.md` (notification templates)
- [x] **কাজ:**
  - প্রতি মিনিটে চলমান ব্যাকগ্রাউন্ড ক্রন হ্যান্ডলার: `scheduledAt <= now()` এবং `PENDING` ডোজগুলো চিহ্নিত করা
  - রোগীর নিবন্ধিত ডিভাইসে বাংলা পুশ নোটিফিকেশন প্রেরণ (ওষুধের নাম, ডোজ, খাবারের আগে/পরে)
  - অ্যাকশন বাটন সহ সরাসরি `/reminder?doseId=...` পেজে নিয়ে যাওয়ার কনফিগারেশন
  - Lazy VAPID initialization হ্যান্ডলিং যা Next.js সার্ভারলেস বিল্ড ক্র্যাশ প্রতিরোধ করে
- [x] **Verification Gate:**
  ```bash
  npx tsc --noEmit   # ✅ 0 errors
  npm run build      # ✅ /api/cron/send-reminders route successfully compiled
  ```

---

### Step 8: Patient Reminder Screen (বড় বোতাম)
- [x] **Target Files:** `app/(patient)/reminder/page.tsx`, `components/patient/ReminderCard.tsx`, `app/api/doses/[id]/route.ts`, `app/api/doses/[id]/confirm/route.ts`
- [x] **Vault Refs:** `03-TOKENS.md` (btn-height-patient ≥ 60px, font ≥ 18px), `01-PRD.md` (৩.৩), `05-SCHEMA.md` (ConfirmDoseSchema)
- [x] **কাজ:**
  - বড় কার্ড UI: ওষুধের নাম, ডোজ, খাবারের নির্দেশনা এবং অডিও স্পিচ বাটন
  - বাধ্যতামূলক নন-নেগোশিয়েবল বাটন নিয়ম পালন: "খেয়েছি" (সবুজ, ৮০px উচ্চতা, ২৪px ফন্ট), "পরে খাবো" (হলুদ, ৬৪px উচ্চতা) এবং "আজকে খাবো না"
  - ব্রাউজার বিল্ট-ইন Web Speech Synthesis দিয়ে স্বয়ংক্রিয় বাংলা ভয়েস প্লেব্যাক
  - কনফার্মেশন API: "খেয়েছি" চাপলে স্ট্যাটাস আপডেট এবং ওষুধের ইনভেন্টরি স্টক হ্রাস; "পরে খাবো" চাপলে ৩০ মিনিট পর পুনঃনির্ধারণ
- [x] **Verification Gate:**
  ```bash
  npx tsc --noEmit    # ✅ 0 errors
  npm run build       # ✅ /reminder & /api/doses/[id]/confirm compiled successfully
  ```

---

## Phase 4: Missed Dose Alert

### Step 9: Caregiver Alert (Missed Dose)
- [ ] **Target Files:** `app/api/cron/missed-alerts/route.ts`, `lib/push.ts`
- [ ] **Vault Refs:** `03-TOKENS.md` (GRACE_PERIOD_MINUTES=30, ESCALATION_MINUTES=60), `05-SCHEMA.md` (Alert), `01-PRD.md` (৩.৪)
- [ ] **কাজ:**
  - প্রতি ৫ মিনিটে: `scheduledAt + 30 min < now()` এবং `PENDING` dose → Caregiver MISSED_FIRST alert
  - `scheduledAt + 60 min < now()` → Caregiver MISSED_ESCALATION alert
  - Alert row তৈরি (duplicate পাঠানো বন্ধ করা)
  - Caregiver-এর push subscription-এ বাংলা alert পাঠানো
- [ ] **Verification Gate:**
  ```bash
  npx tsc --noEmit   # 0 errors
  npm run test       # Alert logic tests (30/60 min threshold) pass
  # Manual: Dose pending রেখে cron hit করলে Caregiver notification আসে
  ```

---

### Step 10: Caregiver ড্যাশবোর্ড
- [ ] **Target Files:** `app/(caregiver)/dashboard/page.tsx`, `components/caregiver/PatientStatusCard.tsx`, `app/api/patients/[id]/dashboard/route.ts`
- [ ] **Vault Refs:** `01-PRD.md` (৩.৫), `03-TOKENS.md` (রঙ)
- [ ] **কাজ:**
  - সব Patient-এর আজকের অবস্থা এক নজরে (খেয়েছে ✅ / বাকি ⏳ / মিস ❌)
  - প্রতিটা Patient-এর ওষুধ তালিকা ও আজকের অগ্রগতি
  - Patient-কে কল করার বোতাম (`tel:` link)
  - Caregiver Patient-এর হয়ে "খেয়েছে" মার্ক করতে পারবে
- [ ] **Verification Gate:**
  ```bash
  npx tsc --noEmit   # 0 errors
  npm run test       # Dashboard API tests pass
  # Manual: Dashboard সঠিক ডেটা দেখায়
  ```

---

## Phase 5: Prescription AI

### Step 11: প্রেসক্রিপশন ছবি → AI Draft
- [ ] **Target Files:** `app/api/prescriptions/analyze/route.ts`, `lib/ai.ts`, `app/(caregiver)/prescriptions/review/page.tsx`, `components/caregiver/PrescriptionReview.tsx`
- [ ] **Vault Refs:** `04-STACK.md` (Gemini API), `05-SCHEMA.md` (PrescriptionDraftSchema), `01-PRD.md` (ধারা ১০)
- [ ] **কাজ:**
  - ছবি আপলোড → Vercel Blob-এ সেভ → Gemini Vision API-তে পাঠানো
  - AI রেসপন্স Zod দিয়ে validate করে Draft বানানো
  - **Draft সরাসরি DB-তে সেভ হবে না** — Review screen-এ দেখানো হবে
  - Caregiver প্রতিটা ওষুধ ঠিক করে/বাদ দিয়ে Confirm চাপলে তবেই Medicine API call
  - AI confidence দেখানো (high/medium/low) + warnings
- [ ] **Verification Gate:**
  ```bash
  npx tsc --noEmit   # 0 errors
  npm run test       # Draft schema validation tests pass
  # Manual: ছবি আপলোড করলে Draft দেখায় (DB-তে সেভ হয় না)
  # Manual: Confirm চাপলে Medicine + Schedule তৈরি হয়
  ```

---

## Phase 6: Refill & History

### Step 12: রিফিল ট্র্যাকিং ও ফার্মেসি WhatsApp অর্ডার
- [ ] **Target Files:** `app/api/cron/refill-check/route.ts`, `app/(caregiver)/refill/page.tsx`, `app/api/pharmacies/route.ts`
- [ ] **Vault Refs:** `03-TOKENS.md` (REFILL_ALERT_DAYS=5), `01-PRD.md` (৩.৬), `05-SCHEMA.md` (Pharmacy)
- [ ] **কাজ:**
  - প্রতিদিন সকাল ৯টায়: স্টক ৫ দিনের কম হলে Caregiver push alert
  - Refill page: কোন ওষুধ কতদিনের আছে তালিকা
  - ফার্মেসি তালিকা + WhatsApp অর্ডার বোতাম (`wa.me/` link দিয়ে pre-filled message)
- [ ] **Verification Gate:**
  ```bash
  npx tsc --noEmit   # 0 errors
  # Manual: স্টক কম থাকলে refill alert আসে
  # Manual: WhatsApp বোতামে ক্লিক করলে সঠিক message pre-filled
  ```

---

### Step 13: ইতিহাস ও Adherence রিপোর্ট
- [ ] **Target Files:** `app/(caregiver)/history/page.tsx`, `app/(patient)/history/page.tsx`, `app/api/doses/history/route.ts`
- [ ] **Vault Refs:** `01-PRD.md` (৩.৫), `03-TOKENS.md` (রঙ)
- [ ] **কাজ:**
  - দৈনিক তালিকা (আজ / গতকাল / তারিখ বেছে)
  - সাপ্তাহিক adherence % গণনা (`taken / (taken + missed)`)
  - Self Mode: Streak গণনা (টানা কতদিন সব ডোজ নিয়েছে)
- [ ] **Verification Gate:**
  ```bash
  npx tsc --noEmit   # 0 errors
  npm run test       # Adherence calculation tests pass
  # Manual: History page সঠিক ডেটা দেখায়
  ```

---

## Phase 7: Polish & Deployment

### Step 14: Onboarding Flow ও Self Mode
- [ ] **Target Files:** `app/(auth)/onboarding/page.tsx`, `components/OnboardingChoice.tsx`
- [ ] **Vault Refs:** `01-PRD.md` (৫.৫ Self Mode), `03-TOKENS.md`
- [ ] **কাজ:**
  - সাইনআপের পর: "নিজের জন্য" নাকি "পরিবারের কারো জন্য" — অথবা দুটোই
  - Self Mode-এ User নিজেই PatientProfile বানায়
  - Self Mode notification logic (Caregiver-এর বদলে নিজের কাছে)

---

### Step 15: E2E Test ও Production Deployment
- [ ] **Target Files:** `tests/e2e/caregiver-flow.spec.ts`, `tests/e2e/patient-flow.spec.ts`, `vercel.json`
- [ ] **Vault Refs:** `04-STACK.md` (Playwright), `01-PRD.md` (critical flows)
- [ ] **কাজ:**
  - Critical path E2E: Signup → Patient তৈরি → ওষুধ যোগ → Dose confirm → Alert check
  - Vercel deployment, Cron jobs কনফিগার (`vercel.json`)
  - PWA আইকন ফাইনাল
- [ ] **Verification Gate:**
  ```bash
  npm run test:e2e   # All E2E tests pass
  npm run build      # Production build 0 errors
  # Manual: Vercel deploy সফল
  # Manual: Android-এ PWA install হয় ও notification আসে
  ```

---

## সারসংক্ষেপ

| Phase | Steps | ফোকাস |
|---|---|---|
| 1: Foundation | 1–3 | Next.js, DB, Auth, PWA |
| 2: Core Data | 4–5 | Patient ও ওষুধ তৈরি |
| 3: Reminder Engine | 6–8 | Dose generation, push, Patient UI |
| 4: Missed Alert | 9–10 | Caregiver alert, dashboard |
| 5: Prescription AI | 11 | ছবি → Draft → Review → Save |
| 6: Refill & History | 12–13 | স্টক, ফার্মেসি, adherence |
| 7: Polish & Deploy | 14–15 | Onboarding, E2E, Vercel |
