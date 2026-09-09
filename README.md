# Lapor-Aman: Secure Online Whistleblower Platform

[![Live Production](https://img.shields.io/badge/Live_Demo-lapor--aman--mu.vercel.app-00dfa2?style=flat&logo=vercel&logoColor=white)](https://lapor-aman-mu.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-15_(App_Router)-black?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat&logo=react&logoColor=white)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-PostgreSQL-C5F74F?style=flat&logo=drizzle&logoColor=black)](https://orm.drizzle.team/)
[![Neon](https://img.shields.io/badge/Neon-Serverless_Postgres-00E599?style=flat&logo=postgresql&logoColor=white)](https://neon.tech/)
[![OpenRouter](https://img.shields.io/badge/AI_Assistant-Gemini_3.5_Flash_Lite-6366F1?style=flat&logo=googlebard&logoColor=white)](https://openrouter.ai/)
[![Cloudflare Turnstile](https://img.shields.io/badge/Bot_Defense-Cloudflare_Turnstile-F38020?style=flat&logo=cloudflare&logoColor=white)](https://developers.cloudflare.com/turnstile/)
[![Security](https://img.shields.io/badge/AES--256-Server--Side_Encrypted-success.svg)](https://en.wikipedia.org/wiki/Advanced_Encryption_Standard)

> **Simulation & Portfolio Context:** Developed as an engineering portfolio and simulation project. Institutional references (Komdigi & POLRI) represent educational simulation modeling.

---

## 1. Overview & Modernization

**Lapor-Aman** is a web-based whistleblower platform designed to facilitate confidential reporting of illegal online gambling operations, predatory endorsement links, and illicit financial channels.

The project was rebuilt from legacy static/hybrid architectures into a modern, 100% serverless Next.js 15 application:
- **Serverless PostgreSQL & Dual-Mode Repository:** Powered by **Drizzle ORM** with **Neon Serverless PostgreSQL** for production, accompanied by an atomic filesystem JSON fallback for offline local resilience.
- **Serverless JWT Authentication:** Stateless session management powered by `jose` with HTTP-only secure cookies and bcrypt password hashing.
- **Zero Client-Side Secrets & Cryptographic Protection:** Personally Identifiable Information (PII) is encrypted with server-side **AES-256-CBC** before persistence. No database credentials or AI keys are ever exposed to the client.
- **Resource-Optimized Smart CAPTCHA:** Integrated with **Cloudflare Turnstile** featuring lazy smart-activation—widgets are only initialized when the user completes required inputs, preventing wasteful API quota consumption on passive page refreshes, and styled with smooth skeleton placeholder transitions.
- **AI Virtual Assistant with Rich Markdown:** Integrated with Google **Gemini 3.5 Flash Lite** via OpenRouter, featuring sliding-window rate limiting, input length validation, prompt injection defenses, and custom-styled markdown rendering (`react-markdown`).
- **Automated Verification Receipts:** Instant client-side generation of structured, timestamped PDF receipts (`jspdf`) containing verified ticket identifiers.

---

## 2. Architecture & Data Flow

```
[ Client Browser (Next.js 15 / React 19) ]
                     |
       +-------------+-------------+
       |                           |
POST /api/chat             POST /api/report & /api/auth/register
       |                           |
[ Sliding Rate Limiter ]    [ Cloudflare Turnstile Verification ]
       |                           |
[ OpenRouter (Gemini 3.5) ] [ Server-Side AES-256 Encryption ]
                                   |
                     [ Drizzle ORM / Neon PostgreSQL ]
                     (Local atomic JSON fallback if DB unset)
```

---

## 3. Key Capabilities

- **Confidential Reporting:** Flexible reporting modes allowing full anonymity or verified citizen submissions.
- **Lazy Cloudflare Turnstile:** Bot defense widgets activate dynamically upon input completion with a skeleton state transition, saving Cloudflare quota and ensuring optimal Core Web Vitals.
- **Automated PDF Receipts:** Instant client-side generation of structured, timestamped PDF receipts (`jspdf`) containing verified ticket identifiers.
- **Status Tracking Timeline:** Public, sanitized progress tracking that reveals status updates and audit logs without exposing reporter information.
- **Administrative Portal:** Role-gated verification interface featuring report filters, status progression actions, encrypted data inspection, and structured CSV export.
- **Interactive AI Assistant:** Floating virtual customer service assistant with customized markdown rendering to answer citizen inquiries regarding reporting procedures, encryption guarantees, and status tracking.

---

## 4. Tech Stack

- **Frontend:** Next.js 15 (App Router), React 19, Tailwind CSS v4, Lucide React, Sonner, React-Markdown
- **Backend & Database:** Next.js Serverless Route Handlers, Drizzle ORM, Neon Serverless PostgreSQL (`@neondatabase/serverless`), Jose (JWT), Bcrypt.js
- **Security & Bot Defense:** Cloudflare Turnstile (`api.js?render=explicit`), Node.js `crypto` (AES-256-CBC)
- **AI Integration:** OpenRouter API (`google/gemini-3.5-flash-lite`) with in-memory sliding-window rate limiting
- **Document Generation:** jsPDF

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
| `DATABASE_URL` | Server | Neon PostgreSQL connection string (Drizzle ORM) |
| `JWT_SECRET` | Server | Symmetric secret key for signing stateless JWT session cookies |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Client | Cloudflare Turnstile public site key |
| `TURNSTILE_SECRET_KEY` | Server | Cloudflare Turnstile server-side validation key |
| `OPENROUTER_API_KEY` | Server | OpenRouter API Key for Gemini virtual assistant |
| `OPENROUTER_MODEL` | Server | AI model identifier (`google/gemini-3.5-flash-lite`) |
| `SERVER_ENCRYPTION_KEY` | Server | AES-256 symmetric secret for encrypting citizen PII fields |
| `ADMIN_EMAILS` | Server | Comma-separated list of allowed administrator email addresses |

---

## 7. Deployment

Production deployment is hosted on **Vercel Serverless**:
- **Live Production URL:** [https://lapor-aman-mu.vercel.app](https://lapor-aman-mu.vercel.app)
- **Production Alias:** [https://lapor-aman-portal.vercel.app](https://lapor-aman-portal.vercel.app)

To deploy updates manually:
```bash
vercel --prod --yes
```

---

## 8. License & Attribution

Developed by **Benny Pepper** ([@bennypepper](https://github.com/bennypepper)). Licensed under the Apache License 2.0.
