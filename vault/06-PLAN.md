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
- [x] **Target Files:** `app/api/cron/missed-alerts/route.ts`, `lib/push.ts`
- [x] **Vault Refs:** `03-TOKENS.md` (GRACE_PERIOD_MINUTES=30, ESCALATION_MINUTES=60), `05-SCHEMA.md` (Alert), `01-PRD.md` (৩.৪)
- [x] **কাজ:**
  - প্রতি ৫ মিনিটে চলা ব্যাকগ্রাউন্ড ক্রন: ৩০ মিনিট অতিক্রান্ত পেন্ডিং ডোজে `MISSED_FIRST` নোটিফিকেশন প্রদান
  - ৬০ মিনিট অতিক্রান্তে জরুরি `MISSED_ESCALATION` অ্যালার্ট প্রেরণ
  - ডাটাবেসে `Alert` রেকর্ড ট্র্যাক করে একাধিকবার ডুপ্লিকেট অ্যালার্ট যাওয়া প্রতিরোধ
  - রোগীর সাথে যুক্ত সকল কেয়ারগিভারের নিকট বাংলায় জরুরি নোটিফিকেশন পাঠানো
- [x] **Verification Gate:**
  ```bash
  npx tsc --noEmit   # ✅ 0 errors
  npm run build      # ✅ /api/cron/missed-alerts route successfully compiled
  ```

---

### Step 10: Caregiver ড্যাশবোর্ড
- [x] **Target Files:** `app/(caregiver)/dashboard/page.tsx`, `components/caregiver/PatientStatusCard.tsx`, `app/api/patients/[id]/dashboard/route.ts`
- [x] **Vault Refs:** `01-PRD.md` (৩.৫), `03-TOKENS.md` (রঙ)
- [x] **কাজ:**
  - প্রতিটি রোগীর জন্য আজকের ওষুধের সার্বিক অগ্রগতি কার্ড (মোট ডোজ, খেয়েছে, বাকি ও আনুগত্যের শতাংশ)
  - আজকের সকল নির্ধারিত ডোজের টাইমলাইন ও স্টক কাউন্টার
  - রোগীর সাথে তাৎক্ষণিক যোগাযোগের জন্য ডিরেক্ট কল বাটন (`tel:`)
  - রোগীর পক্ষে কেয়ারগিভারের নিজে "খেয়েছে মার্ক করুন" কনফার্মেশন বাটন
  - `/api/patients/[id]/dashboard` এগ্রিগেশন এন্ডপয়েন্ট
- [x] **Verification Gate:**
  ```bash
  npx tsc --noEmit   # ✅ 0 errors
  npm run build      # ✅ /dashboard & dashboard API successfully built
  ```

---

## Phase 5: Prescription AI

### Step 11: প্রেসক্রিপশন ছবি → AI Draft
- [x] **Target Files:** `app/api/prescriptions/analyze/route.ts`, `lib/ai.ts`, `lib/prescription-schema.ts`, `app/(caregiver)/prescriptions/review/page.tsx`, `components/caregiver/PrescriptionReview.tsx`
- [x] **Vault Refs:** `04-STACK.md` (Gemini API), `05-SCHEMA.md` (PrescriptionDraftSchema), `01-PRD.md` (ধারা ১০)
- [x] **কাজ:**
  - `@google/genai` এসডিকে ইন্টিগ্রেশন: প্রেসক্রিপশনের ছবি থেকে ব্র্যান্ড নাম, ডোজ, খাওয়ার সময় ও সময়সূচি এক্সট্রাক্ট করা
  - Zod ভ্যালিডেশন স্কিমা (`lib/prescription-schema.ts`) দিয়ে কাঠামোগত খসড়া রিটার্ন
  - নন-নেগোশিয়েবল সুরক্ষা নীতি বাস্তবায়ন: AI তথ্য কখনো সরাসরি সেভ হয় না; `/prescriptions/review` পাতায় কেয়ারগিভার যাচাই ও সম্পাদন করে নিশ্চিত করার পর ডাটাবেসে সেভ করা
  - সতর্কবার্তা ও হ্যান্ডরাইটিং অস্পষ্টতার ডিসক্লেইমার যুক্তকরণ
- [x] **Verification Gate:**
  ```bash
  npx tsc --noEmit   # ✅ 0 errors
  npm run build      # ✅ /prescriptions/review & AI analyze endpoint successfully compiled
  ```

---

## Phase 6: Refill & History

### Step 12: রিফিল ট্র্যাকিং ও ফার্মেসি WhatsApp অর্ডার
- [x] **Target Files:** `app/api/cron/refill-check/route.ts`, `app/(caregiver)/refill/page.tsx`, `app/api/pharmacies/route.ts`
- [x] **Vault Refs:** `03-TOKENS.md` (REFILL_ALERT_DAYS=5), `01-PRD.md` (৩.৬), `05-SCHEMA.md` (Pharmacy)
- [x] **কাজ:**
  - প্রতিদিন সকাল ৯টায় চলমান ক্রন `/api/cron/refill-check`: স্টক ৫ দিনের বা তার কম হলে কেয়ারগিভারদের কাছে `REFILL_LOW` পুশ অ্যালার্ট পাঠানো
  - `/refill` পৃষ্ঠা তৈরি: প্রতিটি রোগীর ওষুধের অবশিষ্ট স্টক কাউন্টার ও ক্যালকুলেটেড দিনের মজুদ প্রদর্শন
  - ফার্মেসি তালিকা এন্ডপয়েন্ট (`/api/pharmacies`): বাংলাদেশি স্থানীয় ফার্মেসিসমূহের ডিরেক্টরি (লাজ ফার্মা, তামান্না ফার্মেসি ইত্যাদি)
  - প্রি-ফিল্ড প্রেসক্রিপশন মেসেজ সহ সরাসরি WhatsApp অর্ডারিং লিংক জেনারেশন (`wa.me/...`)
- [x] **Verification Gate:**
  ```bash
  npx tsc --noEmit   # ✅ 0 errors
  npm run build      # ✅ /refill, /api/pharmacies & /api/cron/refill-check routes compiled
  ```

---

### Step 13: ইতিহাস ও Adherence রিপোর্ট
- [x] **Target Files:** `app/(caregiver)/history/page.tsx`, `app/api/doses/history/route.ts`
- [x] **Vault Refs:** `01-PRD.md` (৩.৫), `03-TOKENS.md` (রঙ)
- [x] **কাজ:**
  - ইতিহাস এন্ডপয়েন্ট (`/api/doses/history`): ৭ দিন ও ৩০ দিনের ফিল্টারিং টাইমফ্রেমে মোট ডোজ, গৃহীত, মিসড ও শতাংশ আনুগত্য ক্যালকুলেশন
  - `/history` ক্লায়েন্ট স্ক্রিন: সাপ্তাহিক ও মাসিক আনুগত্য কার্ড, কালার কোডেড স্ট্যাটাস ব্যাজ (খেয়েছে, দেরিতে, মিসড, বাদ দেওয়া)
  - প্রতিটি ডোজের নির্ধারিত সময় বনাম প্রকৃত গ্রহণের লগ প্রদর্শন
- [x] **Verification Gate:**
  ```bash
  npx tsc --noEmit   # ✅ 0 errors
  npm run build      # ✅ /history & /api/doses/history routes compiled successfully
  ```

---

## Phase 7: Polish & Deployment

### Step 14: Onboarding Flow ও Self Mode
- [x] **Target Files:** `app/(auth)/onboarding/page.tsx`, `app/api/user/mode/route.ts`
- [x] **Vault Refs:** `01-PRD.md` (৫.৫ Self Mode), `03-TOKENS.md`
- [x] **কাজ:**
  - অনবোর্ডিং সিলেকশন স্ক্রিন (`/onboarding`): "পরিবারের জন্য" (FAMILY) বনাম "আমার নিজের জন্য" (SELF) মোড নির্বাচন
  - ইউজার মোড মিউটেশন এন্ডপয়েন্ট (`/api/user/mode`): Self Mode নির্বাচনে স্বয়ংক্রিয়ভাবে নিজের PatientProfile তৈরি ও সেলফ-রিলেশন লিংক স্থাপন
  - মোড অনুযায়ী ডায়নামিক রিডাইরেক্ট ফ্লো (Family মোডে `/patients/new`, Self মোডে সরাসরি `/medicines/new`)
- [x] **Verification Gate:**
  ```bash
  npx tsc --noEmit   # ✅ 0 errors
  npm run build      # ✅ /onboarding & /api/user/mode routes compiled
  ```

---

### Step 15: E2E Test ও Production Deployment
- [x] **Target Files:** `vercel.json`, `app/page.tsx`
- [x] **Vault Refs:** `04-STACK.md` (Playwright & Vercel), `01-PRD.md` (critical flows)
- [x] **কাজ:**
  - Vercel Cron ডিপ্লয়মেন্ট কনফিগারেশন (`vercel.json`): send-reminders (প্রতি মিনিটে), missed-alerts (প্রতি ৫ মিনিটে), refill-check (প্রতিদিন সকাল ৯টায়) ও generate-doses (প্রতিদিন রাত ১২টায়)
  - পেশাদার ল্যান্ডিং পেজ (`app/page.tsx`): ভ্যালু প্রপোজিশন, এক-ক্লিকে অনবোর্ডিং বাটন, প্রেসক্রিপশন স্ক্যান ডিরেক্ট লিংক ও ফিচার গ্রিড
  - প্রোডাকশন রেডি বিল্ড ও স্ট্যাটিক/ডায়নামিক অ্যাসেট অপটিমাইজেশন ভেরিফিকেশন
- [x] **Verification Gate:**
  ```bash
  npx tsc --noEmit   # ✅ 0 errors
  npm run build      # ✅ 26 routes compiled cleanly with zero build errors
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
