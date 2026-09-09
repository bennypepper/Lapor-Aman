export const clientConfig = {
  turnstileSiteKey: (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "0x4AAAAAAB8Es5v_tBV9BFWn").trim(),
  appName: "Lapor-Aman",
  appVersion: "2.0.0",
};

export const serverConfig = {
  turnstileSecretKey: (process.env.TURNSTILE_SECRET_KEY || "").trim(),
  openRouterApiKey: (process.env.OPENROUTER_API_KEY || "").trim(),
  openRouterModel: (process.env.OPENROUTER_MODEL || "google/gemini-3.5-flash-lite").trim(),
  geminiApiKey: (process.env.GEMINI_API_KEY || "").trim(),
  serverEncryptionKey: (process.env.SERVER_ENCRYPTION_KEY || "lapor-aman-dev-secret-key-32-chars-min").trim(),
  adminEmails: (process.env.ADMIN_EMAILS || "benedictmpepper@gmail.com,staffmeridiandigital@gmail.com")
    .split(",")
    .map((e) => e.trim().toLowerCase()),
};

