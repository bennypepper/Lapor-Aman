export const clientConfig = {
  firebase: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDtm53mLPzzFlNRxSjNUjQvzH1BQCODT70",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "lapor-aman-web-2026.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "lapor-aman-web-2026",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "lapor-aman-web-2026.firebasestorage.app",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "623106906854",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:623106906854:web:3965aab08b19b09cde7927",
  },
  turnstileSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "0x4AAAAAAB8Es5v_tBV9BFWn",
  appName: "Lapor-Aman",
  appVersion: "2.0.0",
};

export const serverConfig = {
  turnstileSecretKey: process.env.TURNSTILE_SECRET_KEY || "",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  serverEncryptionKey: process.env.SERVER_ENCRYPTION_KEY || "lapor-aman-dev-secret-key-32-chars-min",
  adminEmails: (process.env.ADMIN_EMAILS || "benedictmpepper@gmail.com,staffmeridiandigital@gmail.com")
    .split(",")
    .map((e) => e.trim().toLowerCase()),
};
