# 04 — Tech Stack & Build Rules

> **প্রজেক্ট:** Medicine Reminder MVP v1.0

---

## অনুমোদিত স্ট্যাক

| অংশ | প্রযুক্তি | ভার্সন | কেন |
|---|---|---|---|
| **Framework** | Next.js (App Router) | 14.x | Full-stack, SSR + API routes একই কোডবেসে |
| **Language** | TypeScript | 5.x | Type safety |
| **Styling** | Tailwind CSS | 3.x | দ্রুত UI, utility-first |
| **ORM** | Prisma | 5.x | Type-safe DB access |
| **Database** | PostgreSQL | 15+ | Relational data (schedules, doses) |
| **DB Hosting** | Neon (serverless Postgres) | — | ফ্রি টিয়ার, Vercel-এর সাথে ভালো |
| **Auth** | NextAuth.js | 5.x (beta) | Phone OTP + Google OAuth |
| **SMS/OTP** | SSL Wireless API | — | বাংলাদেশি SMS gateway |
| **Push Notifications** | Web Push API (VAPID) | — | ব্রাউজার পুশ, Android-এ নির্ভরযোগ্য |
| **PWA** | next-pwa | — | Service Worker + Manifest |
| **Voice Reminder** | Web Speech API (TTS) | — | ব্রাউজারের বিল্ট-ইন, বাংলা সাপোর্ট |
| **Prescription AI** | Google Gemini API (Vision) | gemini-1.5-flash | ছবি থেকে ওষুধ তথ্য বের করা |
| **Scheduler** | Vercel Cron Jobs | — | নির্ধারিত সময়ে reminder পাঠানো |
| **Hosting** | Vercel | — | ফ্রি টিয়ার, Next.js-এর জন্য সেরা |
| **File Upload** | Vercel Blob / Cloudinary | — | প্রেসক্রিপশনের ছবি স্টোরেজ |
| **Validation** | Zod | 3.x | Schema validation, API contract |
| **Testing** | Vitest + React Testing Library | — | Unit + Component tests |
| **E2E Testing** | Playwright | — | Critical flow tests |

---

## নিষিদ্ধ লাইব্রেরি / পদ্ধতি

| নিষিদ্ধ | বিকল্প | কারণ |
|---|---|---|
| `moment.js` | `date-fns` বা `dayjs` | Bundle size বড়, deprecated |
| `axios` | Native `fetch` বা `ky` | Next.js-এ native fetch যথেষ্ট |
| `class-validator` | `zod` | Zod ইতিমধ্যে নির্বাচিত |
| Raw SQL (Prisma ছাড়া) | Prisma ORM | Type safety বজায় রাখতে |
| `any` type (TypeScript) | Proper types বা `unknown` | Type safety ভাঙে |
| AI তথ্য সরাসরি DB-তে সেভ | Draft → Review → Save | Non-negotiable safety rule |
| `localStorage` sensitive data | Server-side session | Security |

---

## ফোল্ডার স্ট্রাকচার

```
medicine-reminder/
├── app/
│   ├── (auth)/              # Login, Signup, OTP
│   ├── (caregiver)/         # Caregiver dashboard, patient management
│   ├── (patient)/           # Patient screens (simple, big buttons)
│   ├── api/                 # API routes
│   │   ├── auth/
│   │   ├── doses/
│   │   ├── medicines/
│   │   ├── notifications/
│   │   └── prescriptions/
│   └── layout.tsx
├── components/
│   ├── ui/                  # Base UI components
│   ├── caregiver/           # Caregiver-specific
│   └── patient/             # Patient-specific (large buttons)
├── lib/
│   ├── db.ts                # Prisma client
│   ├── push.ts              # Web Push helper
│   ├── ai.ts                # Gemini Vision helper
│   └── scheduler.ts         # Cron job logic
├── prisma/
│   └── schema.prisma
├── public/
│   └── manifest.json        # PWA manifest
└── vault/                   # Context Architecture Vault
```

---

## টেস্ট কমান্ড (Verification Gates)

| কমান্ড | উদ্দেশ্য |
|---|---|
| `npx tsc --noEmit` | TypeScript type check (zero errors) |
| `npx prisma validate` | Prisma schema validation |
| `npx prisma db push` | DB schema sync (dev) |
| `npm run test` | Vitest unit tests |
| `npm run test:e2e` | Playwright E2E tests |
| `npm run build` | Next.js production build (zero errors) |
| `npm run lint` | ESLint check |

---

## পরিবেশ ভেরিয়েবল (.env.local)

```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# SSL Wireless (OTP SMS)
SSL_WIRELESS_API_KEY="..."
SSL_WIRELESS_SID="..."

# Web Push (VAPID)
NEXT_PUBLIC_VAPID_PUBLIC_KEY="..."
VAPID_PRIVATE_KEY="..."

# Gemini AI
GEMINI_API_KEY="..."

# File Upload
BLOB_READ_WRITE_TOKEN="..."
```

---

## ডেভেলপমেন্ট শুরু করার কমান্ড

```bash
npm install
npx prisma db push
npm run dev
```
