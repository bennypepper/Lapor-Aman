# Lapor-Aman: Secure Online Whistleblower Platform

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat&logo=react&logoColor=white)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-v11-FFCA28?style=flat&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![OpenRouter](https://img.shields.io/badge/AI_Assistant-Gemini_3.5_Flash_Lite-6366F1?style=flat&logo=googlebard&logoColor=white)](https://openrouter.ai/)
[![Security](https://img.shields.io/badge/AES--256-Server--Side_Encrypted-success.svg)](https://en.wikipedia.org/wiki/Advanced_Encryption_Standard)

> **Academic & Simulation Context:** Developed as an engineering capstone and portfolio project. The simulated institutional workflows (Komdigi & POLRI) represent educational simulation modeling.

---

## 1. Overview & Modernization

**Lapor-Aman** is a web-based whistleblower platform designed to facilitate confidential reporting of illegal online gambling operations, predatory endorsement links, and illicit financial channels.

The project was modernized from an early static prototype into a production-ready **Next.js (App Router)** web application:
- **Refined User Interface:** Redesigned with a high-contrast dark aesthetic, responsive mobile ergonomics, accessible focus states, and streamlined data visualization.
- **Serverless Security Boundary:** Sensitive operations, third-party AI integrations, and cryptographic routines are encapsulated within serverless API routes (`/api/*`), preventing client-side secret exposure.
- **Data Protection:** Personally Identifiable Information (PII) is encrypted with server-side AES-256 before database persistence.
- **AI Virtual Assistant:** Integrated with Google Gemini 3.5 Flash Lite via OpenRouter, featuring sliding-window rate limiting, input length validation, and prompt injection defenses.
- **Automated Verification:** Turnkey bot protection via Cloudflare Turnstile and instantaneous client-side PDF receipt generation.

---

## 2. Architecture & Data Flow

```
[ Client Browser (Next.js 15 / React 19) ]
                     |
       +-------------+-------------+
       |                           |
POST /api/chat             POST /api/report
       |                           |
[ Rate Limiter & Guardrails ] [ Cloudflare Turnstile Check ]
       |                           |
[ OpenRouter (Gemini 3.5) ] [ Server AES-256 Encryption ]
                                   |
                             [ Cloud Firestore ]
```

---

## 3. Key Capabilities

- **Confidential Reporting:** Flexible reporting modes allowing full anonymity or verified submissions.
- **Automated PDF Receipts:** Instant client-side generation of structured, timestamped PDF receipts (`jspdf`) containing verified ticket identifiers.
- **Status Tracking Timeline:** Public, sanitized progress tracking that reveals status updates and audit logs without exposing reporter information.
- **Administrative Portal:** Role-gated verification interface featuring report filters, status progression actions, encrypted data inspection, and structured CSV export.
- **Rate-Limited AI Assistant:** Floating virtual customer service assistant designed to answer user inquiries regarding reporting procedures, encryption guarantees, and status tracking.

---

## 4. Tech Stack

- **Frontend:** Next.js 15 (App Router), React 19, Tailwind CSS v4, Lucide React
- **Backend & Database:** Next.js Serverless Route Handlers, Firebase Web SDK v11, Cloud Firestore, Firebase Storage
- **Security & AI:** OpenRouter API (Gemini 3.5 Flash Lite), CryptoJS, Cloudflare Turnstile, jsPDF

---

## 5. Local Setup & Installation

### Prerequisites
- Node.js 18.18+ or 20+
- npm 10+

### Setup Commands
```bash
# 1. Clone repository
git clone https://github.com/bennypepper/Lapor-Aman.git
cd Lapor-Aman

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local

# 4. Run development server
npm run dev
```

The application will be accessible at `http://localhost:3000`.

---

## 6. Environment Configuration

| Variable | Target | Purpose |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Client | Firebase client SDK authentication |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`| Client | Cloud Firestore target project |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Client | Cloudflare Turnstile public site key |
| `TURNSTILE_SECRET_KEY` | Server | Turnstile server-to-server token validation |
| `OPENROUTER_API_KEY` | Server | OpenRouter API Key for Gemini assistant |
| `OPENROUTER_MODEL` | Server | AI model identifier (`google/gemini-3.5-flash-lite`) |
| `SERVER_ENCRYPTION_KEY` | Server | AES-256 symmetric secret for PII fields |
| `ADMIN_EMAILS` | Server | Allowed administrator email addresses |

---

## 7. License & Attribution

Developed by **Benny Pepper** ([@bennypepper](https://github.com/bennypepper)). Licensed under the Apache License 2.0.
