# LaporAman: Secure Online Gambling Reporting Platform

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat&logo=firebase&logoColor=black)
![Gemini AI](https://img.shields.io/badge/Gemini_AI-8E75B2?style=flat&logo=googlebard&logoColor=white)
![Security](https://img.shields.io/badge/AES--256-Encrypted-success.svg)

> **Disclaimer:** This project was developed as a final project for the **Project Management course** at university. The mention of "PT. Meridian Digital" and collaborations with government agencies (Komdigi, POLRI) are part of the project's fictional business scenario/simulation. It is not an official government platform.

## 📌 Project Overview

**LaporAman** is a secure, full-stack whistleblower platform prototype designed for reporting illegal online gambling sites. It was built to demonstrate proficiency in secure web development, project management principles, and modern cloud infrastructure integration.

The platform prioritizes reporter anonymity using client-side **AES-256 encryption** for all Personally Identifiable Information (PII) before storage. It features a complete reporting flow, real-time ticket tracking, an AI-powered assistant (Gemini 3 Flash), and a secure admin dashboard.

---

## 🛠️ Tech Stack

### Frontend
- **HTML5 & Vanilla JS** - Modular architecture for clean separation of concerns.
- **Tailwind CSS 4.x** - Modern utility-first styling.
- **Lucide Icons** - Consistent UI iconography.

### Backend & Security
- **Firebase 12.x** - Authentication, Cloud Firestore, and Storage.
- **Crypto.js** - Client-side AES-256 encryption for PII.
- **Cloudflare Turnstile** - Privacy-friendly bot protection (CAPTCHA).
- **Content Security Policy (CSP)** - Mitigation against XSS and data injection.

### AI Integration
- **Google Gemini 3 Flash** - Context-aware virtual assistant for user guidance.

---

## 🚀 Key Features

- ✅ **End-to-End PII Protection:** Sensitive user data is encrypted in the browser.
- ✅ **Anonymous Reporting:** Users can choose to hide their identity from public records.
- ✅ **Secure Evidence Upload:** Automated image compression and EXIF metadata stripping.
- ✅ **Real-Time Tracking:** Unique Ticket IDs with a status timeline for progress monitoring.
- ✅ **AI Assistant:** Context-aware chatbot (Gemini 3 Flash) that helps users with the reporting process.
- ✅ **Admin Dashboard:** Secure interface for managing reports, status updates, and data decryption.
- ✅ **PDF Receipts:** Professional automated receipt generation for reported cases.

---

## 📂 Project Structure

```
Lapor-Aman/
├── assets/
│   └── img/                # Project images and logos
├── css/
│   └── style.css           # Custom styles and animations
├── js/
│   ├── admin.js            # Admin dashboard logic
│   ├── auth.js             # Authentication and session management
│   ├── chat.js             # AI chatbot integration
│   ├── main.js             # Application entry point & orchestration
│   ├── report.js           # Reporting logic & PDF generation
│   ├── tracking.js         # Ticket tracking and timeline
│   ├── ui.js               # UI components & interactions
│   └── utils.js            # Shared helpers & security utilities
├── docs/
│   ├── DESIGN.md           # Design system documentation
│   └── task.md             # Project task tracking
├── index.html              # Main reporter interface
├── admin.html              # Protected admin interface
├── config.example.js       # Configuration template
├── firebase.json           # Firebase configuration
├── firestore.rules         # Security rules for Firestore
└── storage.rules           # Security rules for Storage
```

---

## 💻 Setup & Installation

### 1. Firebase Setup
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/).
2. Enable **Authentication** (Email/Password), **Firestore**, and **Storage**.
3. Copy your Web App configuration into the script tags in `index.html` and `admin.html`.

### 2. Environment Configuration
1. Copy `config.example.js` to `config.js`.
2. Update `config.js` with your specific keys:
   - `ENCRYPTION_KEY`: A strong 32-character string.
   - `ADMIN_EMAIL`: Your email used for admin access.
   - `GEMINI_API_KEY`: API key from [Google AI Studio](https://aistudio.google.com/).
   - `TURNSTILE_SITE_KEY`: Site key from Cloudflare Turnstile.

### 3. Deploy Rules
Deploy the security rules to your Firebase project:
```bash
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Developed for educational purposes as part of the University Project Management Course.**
