// config.example.js
// Copy this file to config.js and fill in your actual secrets.
// DO NOT commit config.js to version control.

window.APP_CONFIG = {
    // The symmetric encryption key used for PII data (AES-256).
    // Generate a strong key (e.g., openssl rand -hex 32)
    ENCRYPTION_KEY: "YOUR_SECRET_KEY_HERE_MIN_32_CHARS",

    // The admin email address authorized to access the admin dashboard.
    ADMIN_EMAIL: "admin@example.com",

    // Google Gemini API Key for the AI Chatbot
    GEMINI_API_KEY: "YOUR_GEMINI_API_KEY",

    // Cloudflare Turnstile Site Key (CAPTCHA)
    TURNSTILE_SITE_KEY: "YOUR_TURNSTILE_SITE_KEY",

    // Rate limits in milliseconds
    RATE_LIMITS: {
        FORM_SUBMISSION: 60000,   // 1 minute
        CHAT_MESSAGE: 5000,       // 5 seconds
        TRACKING_LOOKUP: 10000    // 10 seconds
    },

    // App Metadata
    APP_NAME: "Lapor-Aman",
    APP_VERSION: "1.1.0"
};
