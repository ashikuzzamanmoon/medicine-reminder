# 05 — Database Schema & API Contracts

> **প্রজেক্ট:** Medicine Reminder MVP v1.0

---

## Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  name          String
  phone         String?   @unique
  email         String?   @unique
  image         String?
  role          UserRole  @default(CAREGIVER)
  mode          UserMode  @default(FAMILY)  // SELF | FAMILY
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Caregiver → Patients সম্পর্ক
  caregiverLinks CaregiverPatient[] @relation("CaregiverLinks")
  // Patient হিসেবে সম্পর্ক
  patientLinks   CaregiverPatient[] @relation("PatientLinks")
  // Push subscription
  pushSubscriptions PushSubscription[]

  accounts      Account[]
  sessions      Session[]
}

enum UserRole {
  CAREGIVER
  PATIENT
}

enum UserMode {
  SELF    // নিজের জন্য
  FAMILY  // পরিবারের কারো জন্য
}

model CaregiverPatient {
  id          String   @id @default(cuid())
  caregiver   User     @relation("CaregiverLinks", fields: [caregiverId], references: [id])
  caregiverId String
  patient     User     @relation("PatientLinks", fields: [patientId], references: [id])
  patientId   String
  relation    String   // "ছেলে", "মেয়ে", "স্বামী", "স্ত্রী", etc.
  isBackup    Boolean  @default(false) // Self Mode-এ ব্যাকআপ Caregiver
  createdAt   DateTime @default(now())

  @@unique([caregiverId, patientId])
}

model PatientProfile {
  id         String   @id @default(cuid())
  userId     String   @unique
  age        Int?
  image      String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  medicines  Medicine[]
}

model Medicine {
  id              String         @id @default(cuid())
  patientProfile  PatientProfile @relation(fields: [patientProfileId], references: [id])
  patientProfileId String
  name            String
  dose            String         // "১ ট্যাবলেট", "৫ মিলি", etc.
  foodTiming      FoodTiming     @default(AFTER)
  stockCount      Int?           // মোট ট্যাবলেট/ক্যাপসুল সংখ্যা
  prescriptionUrl String?        // প্রেসক্রিপশনের ছবির URL
  isActive        Boolean        @default(true)
  notes           String?
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  schedules  Schedule[]
}

enum FoodTiming {
  BEFORE // খাবারের আগে
  AFTER  // খাবারের পরে
  ANY    // যেকোনো সময়
}

model Schedule {
  id          String       @id @default(cuid())
  medicine    Medicine     @relation(fields: [medicineId], references: [id])
  medicineId  String
  time        String       // "08:00", "13:00", "21:00" (HH:mm)
  label       String?      // "সকাল", "দুপুর", "রাত"
  repeatType  RepeatType   @default(DAILY)
  startDate   DateTime
  endDate     DateTime?    // null = চলমান
  isActive    Boolean      @default(true)
  createdAt   DateTime     @default(now())

  doses       Dose[]
}

enum RepeatType {
  DAILY
  SPECIFIC_DAYS // ভবিষ্যতে
}

model Dose {
  id            String     @id @default(cuid())
  schedule      Schedule   @relation(fields: [scheduleId], references: [id])
  scheduleId    String
  scheduledAt   DateTime   // নির্ধারিত সময় (date + time)
  status        DoseStatus @default(PENDING)
  confirmedAt   DateTime?  // "খেয়েছি" চাপার সময়
  confirmedBy   String?    // userId (Patient নিজে বা Caregiver)
  skippedReason String?    // "খাইনি"-র কারণ
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt

  alerts        Alert[]
}

enum DoseStatus {
  PENDING  // এখনো সময় হয়নি বা হয়েছে কিন্তু confirm হয়নি
  TAKEN    // সময়মতো খাওয়া হয়েছে
  LATE     // দেরিতে খাওয়া হয়েছে
  MISSED   // মিস হয়েছে (দিন শেষে)
  SKIPPED  // ইচ্ছাকৃতভাবে বাদ দেওয়া হয়েছে
}

model Alert {
  id          String    @id @default(cuid())
  dose        Dose      @relation(fields: [doseId], references: [id])
  doseId      String
  userId      String    // যাকে অ্যালার্ট পাঠানো হয়েছে
  type        AlertType
  sentAt      DateTime  @default(now())
  readAt      DateTime?
  delivered   Boolean   @default(false)
}

enum AlertType {
  MISSED_FIRST       // ৩০ মিনিটে প্রথম অ্যালার্ট
  MISSED_ESCALATION  // ১ ঘণ্টায় দ্বিতীয় অ্যালার্ট
  REFILL_LOW         // স্টক কম
  DOSE_CONFIRMED     // ডোজ নিশ্চিত হয়েছে (ঐচ্ছিক)
}

model PushSubscription {
  id           String   @id @default(cuid())
  user         User     @relation(fields: [userId], references: [id])
  userId       String
  endpoint     String   @unique
  p256dh       String
  auth         String
  createdAt    DateTime @default(now())
}

model Pharmacy {
  id          String   @id @default(cuid())
  name        String
  address     String
  area        String   // এলাকা (যেমন: "মিরপুর", "ধানমণ্ডি")
  phone       String
  whatsapp    String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
}

// NextAuth প্রয়োজনীয় models
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

---

## TypeScript Types (Zod Schemas)

```typescript
// lib/schemas.ts

import { z } from "zod"

// ওষুধ যোগ করা
export const CreateMedicineSchema = z.object({
  patientProfileId: z.string().cuid(),
  name: z.string().min(1, "ওষুধের নাম দিন").max(100),
  dose: z.string().min(1, "ডোজ দিন"),
  foodTiming: z.enum(["BEFORE", "AFTER", "ANY"]).default("AFTER"),
  stockCount: z.number().int().positive().optional(),
  prescriptionUrl: z.string().url().optional(),
  notes: z.string().max(500).optional(),
  schedules: z.array(z.object({
    time: z.string().regex(/^\d{2}:\d{2}$/, "HH:mm ফরম্যাটে দিন"),
    label: z.string().optional(),
    startDate: z.string().datetime(),
    endDate: z.string().datetime().optional(),
  })).min(1, "কমপক্ষে একটি সময় দিন"),
})

// ডোজ কনফার্ম করা
export const ConfirmDoseSchema = z.object({
  doseId: z.string().cuid(),
  status: z.enum(["TAKEN", "SKIPPED"]),
  skippedReason: z.string().max(200).optional(),
})

// Patient প্রোফাইল
export const CreatePatientProfileSchema = z.object({
  name: z.string().min(1).max(100),
  age: z.number().int().min(1).max(120).optional(),
  relation: z.string().min(1).max(50),
  image: z.string().url().optional(),
})

// প্রেসক্রিপশন AI রেসপন্স (Draft — সরাসরি সেভ হবে না)
export const PrescriptionDraftSchema = z.object({
  medicines: z.array(z.object({
    name: z.string(),
    dose: z.string(),
    foodTiming: z.enum(["BEFORE", "AFTER", "ANY"]).optional(),
    times: z.array(z.string()),
    durationDays: z.number().optional(),
    confidence: z.enum(["high", "medium", "low"]),
  })),
  rawText: z.string(),
  warnings: z.array(z.string()),
})
```

---

## API Endpoints

| Method | Path | বিবরণ | Auth |
|---|---|---|---|
| `POST` | `/api/auth/send-otp` | ফোনে OTP পাঠানো | Public |
| `POST` | `/api/auth/verify-otp` | OTP যাচাই করে session তৈরি | Public |
| `GET` | `/api/patients` | Caregiver-এর সব Patient তালিকা | Caregiver |
| `POST` | `/api/patients` | নতুন Patient প্রোফাইল | Caregiver |
| `GET` | `/api/patients/[id]/dashboard` | Patient-এর আজকের ড্যাশবোর্ড | Caregiver |
| `POST` | `/api/medicines` | ওষুধ যোগ করা | Caregiver |
| `PATCH` | `/api/medicines/[id]` | ওষুধ এডিট/বন্ধ করা | Caregiver |
| `GET` | `/api/doses/today` | আজকের সব ডোজ (Patient-এর) | Patient |
| `POST` | `/api/doses/[id]/confirm` | ডোজ কনফার্ম (taken/skipped) | Patient/Caregiver |
| `POST` | `/api/prescriptions/analyze` | ছবি আপলোড → AI Draft (save হয় না) | Caregiver |
| `POST` | `/api/notifications/subscribe` | Push subscription সেভ করা | Authenticated |
| `GET` | `/api/pharmacies` | এলাকার ফার্মেসি তালিকা | Authenticated |

---

## Cron Job Endpoints (Vercel Cron)

| Path | Schedule | কাজ |
|---|---|---|
| `/api/cron/send-reminders` | প্রতি মিনিট | due doses-এ push পাঠানো |
| `/api/cron/missed-alerts` | প্রতি ৫ মিনিট | grace period শেষে Caregiver অ্যালার্ট |
| `/api/cron/refill-check` | প্রতিদিন সকাল ৯টা | স্টক চেক ও refill অ্যালার্ট |
