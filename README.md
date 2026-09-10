# 📂 Google Drive Manager AI (গুগল ড্রাইভ ম্যানেজার)

<p align="center">
  <img src="/images/app_logo_1785870607984.jpg" alt="Google Drive AI Manager Logo" width="120" style="border-radius: 20px;" />
</p>

![Google Drive Manager Hero](/images/drive_app_hero_1785870491332.jpg)

একটি আধুনিক, দ্রুত এবং কৃত্রিম বুদ্ধিমত্তা (Gemini AI) চালিত **Google Drive Management System**। এর মাধ্যমে আপনি নিরাপদে আপনার গুগল ড্রাইভের ফাইলসমূহ ব্রাউজ, সার্চ, প্রিভিউ, আপলোড, স্টার্ট (Star) এবং এআই এর সাহায্যে সামারাইজ (Summarize) করতে পারবেন।

---

## 🎨 অ্যাপের ইন্টারফেস ও এআই ফিচারসমূহ (UI & AI Features)

![AI Features & Smart Dashboard](/images/drive_ai_features_1785870505151.jpg)

---

## ✨ প্রধান বৈচিত্র্যময় ফিচারসমূহ (Key Features)

- 🔐 **গুগল ওঅথ (Google OAuth 2.0 Integration):**
  - সরাসরি নিজস্ব গুগল অ্যাকাউন্ট দিয়ে নিরাপদ লগইন ও এক্সেস।
  - পপ-আপ ও আইফ্রেম ফ্রেন্ডলি রিডাইরেক্ট সাপোর্ট।

- 🤖 **Gemini AI ফাইল সামারাইজার (AI Summarizer):**
  - ড্রাইভের যেকোনো ডকুমেন্টস বা পিডিএফ-এর মূল বক্তব্য মুহূর্তেই এআই সামারি হিসেবে তৈরি করুন।

- 📂 **ফাইল ও ফোল্ডার ম্যানেজার (File & Folder Management):**
  - **Grid & List View:** গ্রিড ও লিস্ট মোডে ফাইল দেখার সুবিধা।
  - **Quick Search & Filter:** ক্যাটাগরি অনুসারে (Documents, Images, Videos, Audio, PDFs, Folders) ফিল্টার ও রিয়েলটাইম সার্চ।
  - **Upload & Create:** ড্র্যাগ-অ্যান্ড-ড্রপ বা সিলেক্ট করে ফাইল আপলোড এবং নতুন ফোল্ডার তৈরি।
  - **Star & Trash:** প্রয়োজনীয় ফাইল চিহ্নিত ও ট্র্যাশ ম্যানেজমেন্ট।

- 👁️ **ফাইল প্রিভিউ (In-App File Previewer):**
  - ছবি, অডিও, ভিডিও এবং ফাইল প্রিভিউ সরাসরি অ্যাপের ভেতরে দেখার ব্যবস্থা।
  - 403 Forbidden বা পারমিশন ইস্যু সমাধানের জন্য বিকল্প ড্রাইভ লিংক এক্সেস।

- 🎮 **ডেমো মোড (Interactive Demo Mode):**
  - লগইন না করেও টেস্ট ড্রাইভের সমস্ত ফিচার এক্সপ্লোর করার ১-ক্লিক ডেমো পরিবেশ।

- 📊 **স্টোরেজ ট্র্যাকার (Storage Quota Indicator):**
  - গুগল ড্রাইভের ব্যবহৃত ও অবশিষ্ট স্টোরেজের রিয়েল-টাইম ট্র্যাকিং দৃশ্য।

---

## 🛠️ টেকনোলজি স্ট্যাক (Tech Stack)

| ক্যাটাগরি | ব্যবহৃত প্রযুক্তি |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Tailwind CSS, Lucide Icons |
| **Backend** | Node.js, Express.js |
| **API Integration** | Google Drive API v3 (`googleapis`), `@google/genai` (Gemini API) |
| **Authentication** | Google OAuth2, Firebase Authentication / App Config |
| **Build Tool** | Vite, ESBuild, TSX |

---

## 🚀 লোকাল সেটআপ নির্দেশিকা (Getting Started)

### ১. রিপোজিটরি ক্লোন ও ডিপেন্ডেন্সি ইনস্টল
```bash
npm install
```

### ২. এনভায়রনমেন্ট ভেরিয়েবল (.env)
প্রজেক্টের রুট ডিরেক্টরি এ `.env` ফাইল তৈরি করুন এবং নিচের মানগুলো যুক্ত করুন:
```env
OAUTH_CLIENT_ID=your_google_oauth_client_id
OAUTH_CLIENT_SECRET=your_google_oauth_client_secret
GEMINI_API_KEY=your_gemini_api_key
APP_URL=https://your-app-domain.com
```

### ৩. ডেভেলপমেন্ট সার্ভার চালু করুন
```bash
npm run dev
```
অ্যাপটি স্থানীয়ভাবে `http://localhost:3000` এ রান হবে।

---

## 🔍 সাধারণ সমস্যা ও সমাধান (Troubleshooting)

### ❓ 403 Access Denied / Missing redirect_uri Error
1. Google Cloud Console এর **OAuth Consent Screen** এ গিয়ে আপনার ইমেইলটি **Test Users** তালিকায় যুক্ত করুন।
2. **Authorized Redirect URIs** এ `https://your-domain.com/auth/google/callback` লিংকটি সঠিকভাবে যুক্ত থাকা নিশ্চিত করুন।

---

## 📄 লাইসেন্স (License)
এই প্রজেক্টটি MIT লাইসেন্সের অধীনে সংরক্ষিত।
