# Lapor-Aman: Secure Online Gambling Reporting Platform

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat&logo=react&logoColor=white)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-v11-FFCA28?style=flat&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini_1.5_Flash-Serverless-8E75B2?style=flat&logo=googlebard&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![Security](https://img.shields.io/badge/AES--256-Server--Side_Encrypted-success.svg)](https://en.wikipedia.org/wiki/Advanced_Encryption_Standard)

> **Academic & Simulation Disclaimer:** This project was developed as a comprehensive engineering showcase and course capstone project. The mention of collaborative simulations with government agencies (Komdigi, POLRI) reflects scenario modeling.

---

## 1. System Overview & Modernization

**Lapor-Aman** is a production-grade whistleblower platform engineered to report illegal online gambling operations, predatory endorsement links, and mule bank accounts. 

Originally created as a monolithic vanilla JavaScript SPA, **v2.0** has been completely overhauled into a modern **Next.js (App Router)** architecture to solve critical security vulnerabilities, eliminate client-side secret exposure, and deliver a clinical, high-contrast, anti-"AI slop" user interface.

```
[ Client Browser (Next.js 15 / React 19) ]
                     |
       +-------------+-------------+
       |                           |
POST /api/chat             POST /api/report
       |                           |
[ Gemini 1.5 Flash ]       [ Server-Side AES-256 ]
  (Server Secret)                 |
                           [ Cloud Firestore ]
```

---

## 2. Key Architecture & Security Hardening

- **Zero Client-Side Secret Exposure:** All sensitive credentials (`GEMINI_API_KEY`, AES `SERVER_ENCRYPTION_KEY`, Cloudflare Turnstile private keys) are encapsulated strictly within serverless API routes (`/api/*`).
- **Server-Side AES-256 PII Encryption:** Sensitive reporter fields (Phone, NIK, Home Address) are encrypted on the server before being committed to Cloud Firestore, eliminating plain-text PII leakage.
- **Turnkey Cloudflare Turnstile Bot Defense:** Server-to-server validation prevents spam automation and ticket exhaustion attacks.
- **Virtual CS Assistant (Gemini 1.5 Flash):** Context-aware customer service virtual agent operating under strict behavioral bounds and prompt injection defenses.
- **Client-Side PDF Ticket Generation:** Instant, verifiable PDF receipt (`jspdf`) with ticket numbers for tracking.
- **Admin Verification Portal:** Role-gated dashboard with status transition audit trails, on-demand AES decryption tool, and structured CSV export.

---

## 3. Tech Stack

- **Framework:** Next.js 15 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS v4, Lucide React (monochrome micro-icons)
- **Database & Auth:** Firebase Web SDK v11, Cloud Firestore, Firebase Storage
- **AI & Security:** Google Generative AI SDK, CryptoJS, Cloudflare Turnstile

---

## 4. Getting Started

### Prerequisites
- Node.js 18.18+ or 20+
- npm 10+

### Installation & Local Run
```bash
# 1. Clone repository
git clone https://github.com/bennypepper/Lapor-Aman.git
cd Lapor-Aman

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env.local

# 4. Start development server
npm run dev
```
Navigate to `http://localhost:3000`.

---

## 5. Environment Variables Reference

| Variable | Scope | Purpose |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Client | Firebase client SDK authentication |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`| Client | Firestore and Storage target project |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Client | Cloudflare Turnstile public site key |
| `TURNSTILE_SECRET_KEY` | Server | Turnstile server-to-server verification |
| `GEMINI_API_KEY` | Server | Gemini 1.5 Flash AI Assistant |
| `SERVER_ENCRYPTION_KEY` | Server | AES-256 symmetric key for reporter PII |
| `ADMIN_EMAILS` | Server | Comma-separated admin authorized emails |

---

## 6. License & Authorship

Developed and engineered by **Benny Pepper** ([@bennypepper](https://github.com/bennypepper)). Licensed under the Apache License 2.0.
