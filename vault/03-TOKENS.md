# 03 — Design Tokens & System Constants

> **প্রজেক্ট:** Medicine Reminder MVP v1.0

---

## রঙ (Color Palette)

| Token | Hex | ব্যবহার |
|---|---|---|
| `color-primary` | `#16A34A` | সবুজ — "খেয়েছি" বোতাম, সফলতা |
| `color-primary-dark` | `#15803D` | Hover state |
| `color-warning` | `#F59E0B` | "পরে খাবো", স্টক কম অ্যালার্ট |
| `color-danger` | `#DC2626` | "খাইনি", মিসড ডোজ, escalation অ্যালার্ট |
| `color-info` | `#2563EB` | সাধারণ নোটিফিকেশন, তথ্য |
| `color-bg` | `#F9FAFB` | পেজের ব্যাকগ্রাউন্ড |
| `color-surface` | `#FFFFFF` | কার্ড, মোডাল |
| `color-border` | `#E5E7EB` | ডিভাইডার, ইনপুট বর্ডার |
| `color-text-primary` | `#111827` | মূল টেক্সট |
| `color-text-secondary` | `#6B7280` | সাবটাইটেল, placeholder |
| `color-text-on-primary` | `#FFFFFF` | প্রাইমারি বোতামের টেক্সট |

---

## টাইপোগ্রাফি

| Token | মান | ব্যবহার |
|---|---|---|
| `font-family` | `'Hind Siliguri', 'Noto Sans Bengali', sans-serif` | পুরো অ্যাপ (বাংলা সাপোর্ট) |
| `font-size-xs` | `12px` | ক্যাপশন, ট্যাগ |
| `font-size-sm` | `14px` | সাবটেক্সট |
| `font-size-base` | `16px` | ডিফল্ট বডি |
| `font-size-lg` | `18px` | **Patient স্ক্রিনের মিনিমাম** |
| `font-size-xl` | `20px` | সেকশন হেডার |
| `font-size-2xl` | `24px` | পেজ টাইটেল |
| `font-size-3xl` | `30px` | মূল অ্যাকশন (রিমাইন্ডার স্ক্রিন) |
| `font-weight-normal` | `400` | — |
| `font-weight-medium` | `500` | — |
| `font-weight-bold` | `700` | — |

---

## স্পেসিং (Spacing Scale)

| Token | মান |
|---|---|
| `space-1` | `4px` |
| `space-2` | `8px` |
| `space-3` | `12px` |
| `space-4` | `16px` |
| `space-6` | `24px` |
| `space-8` | `32px` |
| `space-12` | `48px` |

---

## বোতাম (Button)

| Token | মান | নোট |
|---|---|---|
| `btn-height-default` | `48px` | সাধারণ বোতাম |
| `btn-height-patient` | `64px` | **Patient স্ক্রিনের মিনিমাম ৬০px+** |
| `btn-border-radius` | `12px` | রাউন্ডেড |
| `btn-font-size-patient` | `20px` | Patient বোতামের টেক্সট |

---

## ব্রেকপয়েন্ট

| Token | মান | ব্যবহার |
|---|---|---|
| `screen-sm` | `640px` | ছোট মোবাইল |
| `screen-md` | `768px` | ট্যাবলেট |
| `screen-lg` | `1024px` | ডেস্কটপ Caregiver |

---

## সিস্টেম কনস্ট্যান্ট

| কনস্ট্যান্ট | মান | বিবরণ |
|---|---|---|
| `GRACE_PERIOD_MINUTES` | `30` | ডোজের সময়ের পর কতক্ষণে প্রথম Caregiver অ্যালার্ট |
| `ESCALATION_MINUTES` | `60` | দ্বিতীয় অ্যালার্ট (escalation) |
| `SNOOZE_MINUTES` | `30` | "পরে খাবো" সময় |
| `REFILL_ALERT_DAYS` | `5` | স্টক কতদিনের হলে অ্যালার্ট |
| `SELF_MODE_BACKUP_MISSED` | `2` | Self Mode-এ পরপর কতটা মিস হলে ব্যাকআপ Caregiver-কে জানাবে |
| `MAX_CAREGIVERS_FREE` | `1` | ফ্রি প্ল্যানে সর্বোচ্চ Caregiver সংখ্যা |
| `MAX_PATIENTS_FREE` | `1` | ফ্রি প্ল্যানে সর্বোচ্চ Patient সংখ্যা |
| `OTP_EXPIRY_SECONDS` | `300` | OTP মেয়াদ (৫ মিনিট) |
| `PRESCRIPTION_AI_PROVIDER` | `gemini-1.5-flash` | ভিশন AI মডেল |

---

## নোটিফিকেশন টেমপ্লেট (বাংলা)

| ঘটনা | টেমপ্লেট |
|---|---|
| ডোজ রিমাইন্ডার (Patient) | `"{patient_name}, এখন {medicine_name}-এর সময়। ডোজ: {dose}।"` |
| মিসড অ্যালার্ট (Caregiver) | `"{patient_name} {medicine_name} এখনো খাননি ({time} ছিল)।"` |
| Escalation (Caregiver) | `"জরুরি: {patient_name} {medicine_name} ১ ঘণ্টা ধরে খাননি।"` |
| রিফিল অ্যালার্ট (Caregiver) | `"{patient_name}-এর {medicine_name} মাত্র {days} দিনের আছে।"` |
| ডোজ নিশ্চিত (Caregiver, ঐচ্ছিক) | `"✅ {patient_name} {medicine_name} খেয়েছেন ({time})।"` |
