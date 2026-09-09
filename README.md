# LaporAman: Secure Online Gambling Reporting Platform

![Next.js](https://img.shields.io/badge/Next.js-15_(App_Router)-black?style=flat&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-blue?style=flat&logo=react&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_Serverless-00E599?style=flat&logo=postgresql&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Gemini_AI-3.5_Flash-8E75B2?style=flat&logo=googlebard&logoColor=white)
![Security](https://img.shields.io/badge/AES--256-Encrypted-success.svg)

> **Disclaimer:** This project was developed as a final project for the **Project Management course** at university. The mention of "PT. Meridian Digital" and collaborations with government agencies (Komdigi, POLRI) are part of the project's fictional business scenario/simulation. It is not an official government platform.

## Project Overview

**LaporAman** is a secure, full-stack whistleblower platform prototype designed for reporting illegal online gambling sites. It was built to demonstrate proficiency in secure web development, project management principles, and modern cloud infrastructure integration.

The platform prioritizes reporter anonymity using server-side **AES-256 encryption** for all Personally Identifiable Information (PII) before storage. It features a complete reporting flow, real-time ticket tracking, an AI-powered assistant (Gemini 3.5 Flash Lite), and a secure admin dashboard.

---

## Tech Stack

### Frontend
- **Next.js 15 (App Router) & React 19** - Modern serverless architecture with server and client components.
- **Tailwind CSS 4.x** - Modern utility-first styling with custom cybersecurity dark theme.
- **Lucide Icons** - Consistent UI iconography.

### Backend & Security
- **Next.js Serverless Route Handlers** - High-performance backend endpoints running on edge/serverless runtime.
- **Neon PostgreSQL & Drizzle ORM** - Type-safe relational database with atomic fallback persistence.
- **AES-256-CBC Encryption** - Robust server-side cryptographic protection for citizen PII before storage.
- **JWT Authentication (`jose`) & Bcrypt.js** - Stateless session management via HTTP-only secure cookies and hashed credentials.
- **Cloudflare Turnstile** - Smart lazy-loaded, privacy-friendly bot protection (CAPTCHA).
- **Rate Limiting & Security Headers** - Sliding-window rate limiting on sensitive routes to mitigate abuse.

### AI Integration
- **Google Gemini 3.5 Flash Lite** - Context-aware virtual assistant for citizen guidance, reporting assistance, and FAQ resolution.

---

## Key Features

- **End-to-End PII Protection:** Sensitive user data (NIK, Name, Contact) is encrypted using server-side AES-256-CBC before database persistence.
- **Anonymous Reporting:** Users can choose to hide their identity completely with one-click anonymous submission.
- **Secure Evidence Handling:** Client-side preview, validation, and metadata sanitization.
- **Real-Time Tracking:** Unique Ticket IDs (e.g., `LPR-YYMMDD-XXXXXX`) with an audit status timeline for progress monitoring.
- **AI Virtual Assistant:** Context-aware chatbot (Gemini 3.5 Flash Lite) with formatted markdown responses to guide users through the reporting and tracking process.
- **Interactive FAQ & Accessibility:** Integrated questions answering common privacy concerns and a floating scroll-to-top feature.
- **Admin Dashboard:** Role-gated interface for reviewing reports, updating verification statuses, inspecting decrypted data, and exporting records.
- **Automated PDF Receipts:** Client-side generation of verifiable, timestamped PDF receipts for reported cases.

---

## Project Structure

```
Lapor-Aman/
├── public/
│   └── assets/img/             # Project logos (PT. Meridian Digital, Komdigi, POLRI)
├── src/
│   ├── app/                    # Next.js App Router (pages & serverless API routes)
│   │   ├── admin/              # Protected admin dashboard
│   │   ├── api/                # Serverless API endpoints (auth, chat, report, track)
│   │   ├── globals.css         # Styling and custom cyber animations
│   │   ├── layout.tsx          # Root application layout
│   │   └── page.tsx            # Main citizen reporting interface
│   ├── components/             # Reusable UI components
│   │   ├── AuthModal.tsx       # Modal for citizen login and registration
│   │   ├── ChatDrawer.tsx      # AI Virtual Assistant drawer & floating callout
│   │   ├── FAQSection.tsx      # Interactive FAQ accordion
│   │   ├── Footer.tsx          # PT. Meridian Digital footer with legal modals
│   │   ├── Navbar.tsx          # Brand navbar with institutional partner tags
│   │   ├── ReportForm.tsx      # Form for report submission with Turnstile CAPTCHA
│   │   ├── ScrollToTop.tsx     # Smooth scroll-to-top floating action
│   │   └── TrackingView.tsx    # Real-time ticket tracking timeline
│   ├── db/                     # Database layer
│   │   ├── index.ts            # Database client connection
│   │   ├── repo.ts             # Hybrid repository (Neon PostgreSQL + atomic fallback)
│   │   └── schema.ts           # Drizzle ORM schema definitions
│   └── lib/                    # Security, auth, and helper utilities
│       ├── auth.ts             # JWT token handling and bcrypt verification
│       ├── crypto.ts           # Server-side AES-256 encryption engine
│       ├── rate-limiter.ts     # In-memory sliding-window rate limiter
│       └── utils.ts            # Utility functions
├── docs/                       # Design system and course project documentation
├── .env.example                # Environment variables template
├── next.config.mjs             # Next.js configuration
├── package.json                # Project dependencies and npm scripts
└── tsconfig.json               # TypeScript configuration
```

---

## Setup & Installation

### 1. Prerequisites
- Node.js 18.18+ or 20+
- npm, pnpm, or yarn
- Cloudflare Turnstile account (free)
- Google AI Studio (or OpenRouter) API Key

### 2. Environment Configuration
1. Clone the repository and navigate to the project root:
   ```bash
   git clone https://github.com/bennypepper/Lapor-Aman.git
   cd Lapor-Aman
   ```
2. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
3. Update `.env.local` with your configuration:
   - `DATABASE_URL`: Neon Serverless PostgreSQL connection string (optional, falls back to atomic local store if empty).
   - `JWT_SECRET`: A strong secret string for signing auth tokens.
   - `NEXT_PUBLIC_TURNSTILE_SITE_KEY`: Cloudflare Turnstile public site key.
   - `TURNSTILE_SECRET_KEY`: Cloudflare Turnstile secret key.
   - `SERVER_ENCRYPTION_KEY`: A strong 32-character string for AES-256 encryption.
   - `OPENROUTER_API_KEY` or `GEMINI_API_KEY`: API key for Gemini AI virtual assistant.
   - `ADMIN_EMAILS`: Comma-separated allowlist of administrator email addresses.

### 3. Local Development
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build & Production
```bash
npm run build
npm start
```

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Developed for educational purposes as part of the University Project Management Course.**
