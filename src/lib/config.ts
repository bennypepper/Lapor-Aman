export const clientConfig = {
  turnstileSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "0x4AAAAAAB8Es5v_tBV9BFWn",
  appName: "Lapor-Aman",
  appVersion: "2.0.0",
};

export const serverConfig = {
  turnstileSecretKey: process.env.TURNSTILE_SECRET_KEY || "",
  openRouterApiKey: process.env.OPENROUTER_API_KEY || "",
  openRouterModel: process.env.OPENROUTER_MODEL || "google/gemini-3.5-flash-lite",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  serverEncryptionKey: process.env.SERVER_ENCRYPTION_KEY || "lapor-aman-dev-secret-key-32-chars-min",
  adminEmails: (process.env.ADMIN_EMAILS || "benedictmpepper@gmail.com,staffmeridiandigital@gmail.com")
    .split(",")
    .map((e) => e.trim().toLowerCase()),
};

