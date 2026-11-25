import { serverConfig } from "./server-config";

export interface TurnstileVerificationResult {
  ok: boolean;
  status: number;
  error?: string;
  mode?: string;
}

export async function verifyTurnstileToken(
  token: unknown,
  remoteIp?: string
): Promise<TurnstileVerificationResult> {
  const secretKey = serverConfig.turnstileSecretKey;

  if (!secretKey) {
    if (process.env.NODE_ENV === "production") {
      return {
        ok: false,
        status: 503,
        error: "Layanan verifikasi keamanan belum dikonfigurasi.",
      };
    }
    return { ok: true, status: 200, mode: "bypass-dev" };
  }

  if (typeof token !== "string" || !token.trim()) {
    return {
      ok: false,
      status: 400,
      error: "Verifikasi CAPTCHA wajib diselesaikan.",
    };
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", token.trim());
    if (remoteIp) {
      formData.append("remoteip", remoteIp);
    }

    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData,
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      return {
        ok: false,
        status: 503,
        error: "Layanan verifikasi CAPTCHA sedang tidak tersedia. Silakan coba lagi.",
      };
    }

    const outcome = (await res.json()) as { success?: boolean; hostname?: string };
    if (!outcome?.success) {
      return {
        ok: false,
        status: 400,
        error: "Validasi CAPTCHA gagal. Silakan coba kembali.",
      };
    }

    const allowedHostnames = serverConfig.allowedTurnstileHostnames;
    if (allowedHostnames.length > 0) {
      const outcomeHost = (outcome.hostname || "").toLowerCase();
      if (!allowedHostnames.includes(outcomeHost)) {
        return {
          ok: false,
          status: 400,
          error: "Validasi domain CAPTCHA tidak sesuai.",
        };
      }
    }

    return { ok: true, status: 200 };
  } catch (err) {
    console.error("Turnstile verification request failed:", err);
    return {
      ok: false,
      status: 503,
      error: "Layanan verifikasi CAPTCHA sedang tidak tersedia. Silakan coba lagi.",
    };
  }
}
