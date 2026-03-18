# LaporAman: Secure Online Gambling Reporting Platform 🛡️

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white) ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white) ![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat&logo=firebase&logoColor=black) ![Gemini AI](https://img.shields.io/badge/Gemini_AI-8E75B2?style=flat&logo=googlebard&logoColor=white) ![Security](https://img.shields.io/badge/AES--256-Encrypted-success.svg)

Developed as a final project for a Project Management course, **LaporAman** is a highly secure, full-stack whistleblower platform designed to report illegal online gambling sites safely. 

## 📌 Project Overview
Protecting reporter identity is the highest priority when reporting cybercrime. This platform ensures complete anonymity by utilizing client-side **AES-256 encryption** for all Personally Identifiable Information (PII) before it ever reaches the database. The system includes a comprehensive user reporting flow, real-time ticket tracking, an AI-powered customer service chatbot, and a secure admin dashboard for managing submissions.

## 🛠️ Tech Stack & Tools
* **Frontend:** HTML5, Tailwind CSS, Lucide Icons
* **Backend & BaaS:** Firebase (Firestore, Auth, Storage, Hosting)
* **Security:** Crypto.js (AES Encryption), Cloudflare Turnstile (CAPTCHA)
* **AI Integration:** Google Gemini 2.5 Flash API (Smart Chatbot)
* **Utilities:** jsPDF (Automated Receipts), Marked.js (Markdown parsing)

## 🚀 Key Features
* **End-to-End PII Encryption:** Sensitive user data (NIK, Phone, Address) is encrypted directly in the browser. Only admins with the specific decryption key can unlock the data.
* **Automated Image Security:** Uploaded evidence images are automatically compressed via HTML5 Canvas, stripping potentially identifying EXIF metadata before uploading to Firebase Storage.
* **Real-Time Ticket Tracking:** Users receive a unique `Ticket ID` upon submission, allowing them to track the status of their report (New, Verified, Processed, Completed, Rejected).
* **Smart AI Chatbot:** An integrated virtual assistant powered by Gemini AI that accesses real-time Firebase context to answer user queries about their report status.
* **Admin Dashboard:** A restricted portal for authorized staff to manage reports, update ticket statuses, export data to CSV, and decrypt user profiles.

## 📂 Repository Structure
```text
lapor-judol-platform/
├── firebase.json          # Firebase deployment configuration
├── index.html             # Main reporting interface
├── admin.html             # Protected admin dashboard
├── script.js              # Core logic, encryption, and AI integration
├── admin.js               # Admin data management and CSV export
├── style.css              # Custom styling and animations
└── README.md
```

## 💻 How to Run Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/lapor-judol-platform.git
   cd lapor-judol-platform
   ```

2. **Serve the application:**
   Since this project uses ES Modules (`type="module"`) for Firebase, you cannot just open the HTML file directly in the browser due to CORS restrictions. You must serve it via a local web server. 
   
   If you have Python installed:
   ```bash
   python -m http.server 8000
   ```
   *Then navigate to `http://localhost:8000` in your browser.*

3. **Admin Access:**
   To access the admin panel and decrypt the mock data, log in with the authorized staff email and use the decryption key: `LaporAman2025`.
