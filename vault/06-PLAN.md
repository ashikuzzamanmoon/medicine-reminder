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
- [ ] **Target Files:** `app/api/auth/[...nextauth]/route.ts`, `lib/auth.ts`, `app/api/auth/send-otp/route.ts`, `app/api/auth/verify-otp/route.ts`
- [ ] **Vault Refs:** `04-STACK.md`, `05-SCHEMA.md` (Account, Session, VerificationToken)
- [ ] **কাজ:**
  - NextAuth.js v5 ইনস্টল ও Google provider কনফিগার
  - Custom Phone OTP flow: `send-otp` → SSL Wireless API (mock করা যাবে dev-এ), `verify-otp` → session তৈরি
  - Zod দিয়ে request validation
- [ ] **Verification Gate:**
  ```bash
  npx tsc --noEmit   # 0 errors
  npm run dev        # Server starts
  # Manual: Google OAuth login কাজ করে
  # Manual: OTP send/verify endpoint 200 রিটার্ন করে
  ```

---

### Step 3: PWA + Web Push VAPID সেটআপ
- [ ] **Target Files:** `public/manifest.json`, `public/sw.js` (Service Worker), `lib/push.ts`, `app/api/notifications/subscribe/route.ts`
- [ ] **Vault Refs:** `04-STACK.md`, `03-TOKENS.md` (রঙ, app name)
- [ ] **কাজ:**
  - `next-pwa` ইনস্টল ও কনফিগার
  - PWA manifest (নাম: "ওষুধ রিমাইন্ডার", রঙ, আইকন placeholder)
  - VAPID keys generate ও `.env.local`-এ সেট
  - `lib/push.ts`: `sendPushNotification(subscription, payload)` helper
  - Push subscription save করার API endpoint
- [ ] **Verification Gate:**
  ```bash
  npx tsc --noEmit     # 0 errors
  npm run build        # PWA assets generated
  # Manual: Lighthouse PWA audit — installable
  # Manual: Push subscription endpoint 201 রিটার্ন করে
  ```

---

## Phase 2: Core Data & Auth UI

### Step 4: Patient প্রোফাইল তৈরির UI ও API
- [ ] **Target Files:** `app/(caregiver)/patients/new/page.tsx`, `components/caregiver/PatientForm.tsx`, `app/api/patients/route.ts`, `lib/schemas.ts` (CreatePatientProfileSchema)
- [ ] **Vault Refs:** `03-TOKENS.md` (রঙ, ফন্ট), `05-SCHEMA.md` (PatientProfile), `01-PRD.md` (ব্যবহারকারীর ফ্লো)
- [ ] **কাজ:**
  - Patient যোগ করার ফর্ম (নাম, বয়স, সম্পর্ক, ছবি optional)
  - Zod validation + Prisma দিয়ে DB-তে সেভ
  - Caregiver-Patient লিঙ্ক তৈরি (CaregiverPatient)
- [ ] **Verification Gate:**
  ```bash
  npx tsc --noEmit   # 0 errors
  npm run test       # Patient form validation tests pass
  # Manual: Patient তৈরি করলে DB-তে row আসে
  ```

---

### Step 5: ওষুধ যোগ করার UI ও API (হাতে এন্ট্রি)
- [ ] **Target Files:** `app/(caregiver)/medicines/new/page.tsx`, `components/caregiver/MedicineForm.tsx`, `app/api/medicines/route.ts`
- [ ] **Vault Refs:** `03-TOKENS.md`, `05-SCHEMA.md` (Medicine, Schedule), `01-PRD.md` (৩.২)
- [ ] **কাজ:**
  - ওষুধের ফর্ম: নাম, ডোজ, food timing, স্টক সংখ্যা, সময়সূচি (একাধিক সময় যোগ করা যাবে)
  - Zod validation (CreateMedicineSchema)
  - Medicine + Schedule DB-তে সেভ
- [ ] **Verification Gate:**
  ```bash
  npx tsc --noEmit   # 0 errors
  npm run test       # Medicine form + API tests pass
  # Manual: ওষুধ যোগ করলে Medicine ও Schedule table-এ row আসে
  ```

---

## Phase 3: Reminder Engine

### Step 6: Dose Generation Cron Job
- [ ] **Target Files:** `app/api/cron/generate-doses/route.ts`, `lib/scheduler.ts`
- [ ] **Vault Refs:** `05-SCHEMA.md` (Dose, Schedule), `03-TOKENS.md` (GRACE_PERIOD_MINUTES)
- [ ] **কাজ:**
  - প্রতিদিন রাত ১২টায় (অথবা on-demand) active Schedule গুলো দেখে সেদিনের Dose rows তৈরি করা
  - ইতিমধ্যে তৈরি থাকলে duplicate না করা
- [ ] **Verification Gate:**
  ```bash
  npx tsc --noEmit   # 0 errors
  npm run test       # Dose generation logic tests pass
  # Manual: Cron এ hit করলে সেদিনের doses তৈরি হয়
  ```

---

### Step 7: Patient-এর Reminder Push পাঠানো
- [ ] **Target Files:** `app/api/cron/send-reminders/route.ts`, `lib/push.ts`
- [ ] **Vault Refs:** `05-SCHEMA.md` (Dose, PushSubscription), `03-TOKENS.md` (notification templates)
- [ ] **কাজ:**
  - প্রতি মিনিটে চলবে (Vercel Cron)
  - `scheduledAt <= now()` এবং `status = PENDING` dose গুলো খোঁজা
  - Patient-এর push subscription-এ বাংলা notification পাঠানো
  - Web TTS trigger করার payload পাঠানো
- [ ] **Verification Gate:**
  ```bash
  npx tsc --noEmit   # 0 errors
  npm run test       # Push sending logic tests pass
  # Manual: নির্ধারিত সময়ে Android-এ notification আসে
  ```

---

### Step 8: Patient Reminder Screen (বড় বোতাম)
- [ ] **Target Files:** `app/(patient)/reminder/page.tsx`, `components/patient/ReminderCard.tsx`, `app/api/doses/[id]/confirm/route.ts`
- [ ] **Vault Refs:** `03-TOKENS.md` (btn-height-patient ≥ 60px, font ≥ 18px), `01-PRD.md` (৩.৩), `05-SCHEMA.md` (ConfirmDoseSchema)
- [ ] **কাজ:**
  - বড় কার্ড: ওষুধের নাম, ডোজ, সময়
  - তিনটি বোতাম: "খেয়েছি" (সবুজ), "পরে খাবো" (হলুদ), "খাইনি" (লাল)
  - Web TTS দিয়ে বাংলা ভয়েস প্লে করা
  - Confirm API: status আপডেট (TAKEN/SKIPPED), stockCount কমানো
  - "পরে খাবো": ৩০ মিনিট পরে নতুন reminder schedule
- [ ] **Verification Gate:**
  ```bash
  npx tsc --noEmit    # 0 errors
  npm run test        # Confirm API tests pass
  # Manual: "খেয়েছি" চাপলে Dose status TAKEN হয়, stockCount কমে
  # Manual: বোতাম height ≥ 60px (DevTools দিয়ে মাপা)
  # Manual: বাংলা ভয়েস শোনা যায়
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
