const DEV_JWT_SECRET = "lapor-aman-dev-only-jwt-secret-key-min-32-chars!";
const DEV_ENCRYPTION_KEY = "lapor-aman-dev-only-aes-encryption-key-32-chars!";

function resolveSecret(envName: "JWT_SECRET" | "SERVER_ENCRYPTION_KEY", devFallback: string): string {
  const value = (process.env[envName] || "").trim();
  if (process.env.NODE_ENV === "production") {
    if (!value || value.length < 32) {
      throw new Error(
        `${envName} must be configured and at least 32 characters long in production.`
      );
    }
    return value;
  }
  return value || devFallback;
}

export const serverConfig = {
  get turnstileSecretKey(): string {
    return (process.env.TURNSTILE_SECRET_KEY || "").trim();
  },
  get allowedTurnstileHostnames(): string[] {
    return (process.env.ALLOWED_TURNSTILE_HOSTNAMES || "")
      .split(",")
      .map((h) => h.trim().toLowerCase())
      .filter(Boolean);
  },
  get openRouterApiKey(): string {
    return (process.env.OPENROUTER_API_KEY || "").trim();
  },
  get openRouterModel(): string {
    return (process.env.OPENROUTER_MODEL || "google/gemini-3.5-flash-lite").trim();
  },
  get geminiApiKey(): string {
    return (process.env.GEMINI_API_KEY || "").trim();
  },
  get jwtSecret(): string {
    return resolveSecret("JWT_SECRET", DEV_JWT_SECRET);
  },
  get serverEncryptionKey(): string {
    return resolveSecret("SERVER_ENCRYPTION_KEY", DEV_ENCRYPTION_KEY);
  },
  get adminEmails(): string[] {
    return (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
  },
};
