interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const ipStore = new Map<string, RateLimitEntry>();

// Periodic cleanup of stale entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of ipStore.entries()) {
      if (entry.resetAt < now) {
        ipStore.delete(ip);
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * Checks if a given IP is rate limited.
 * @param ip - Client IP identifier
 * @param maxRequests - Max requests allowed in the window (default 6 requests)
 * @param windowMs - Window duration in milliseconds (default 60 seconds)
 */
export function checkRateLimit(
  ip: string,
  maxRequests: number = 6,
  windowMs: number = 60 * 1000
): { allowed: boolean; remaining: number; resetSeconds: number } {
  const now = Date.now();
  const cleanIp = ip || "unknown_ip";
  const entry = ipStore.get(cleanIp);

  if (!entry || entry.resetAt < now) {
    ipStore.set(cleanIp, {
      count: 1,
      resetAt: now + windowMs,
    });
    return { allowed: true, remaining: maxRequests - 1, resetSeconds: Math.ceil(windowMs / 1000) };
  }

  if (entry.count >= maxRequests) {
    const resetSeconds = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
    return { allowed: false, remaining: 0, resetSeconds };
  }

  entry.count += 1;
  const resetSeconds = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
  return { allowed: true, remaining: maxRequests - entry.count, resetSeconds };
}

/**
 * Basic guardrail filter to detect and neutralize prompt injection attempts.
 */
export function checkPromptSafety(input: string): { safe: boolean; reason?: string } {
  if (input.length > 500) {
    return { safe: false, reason: "Pesan terlalu panjang (maksimal 500 karakter)." };
  }

  const suspiciousPatterns = [
    /ignore (all )?(previous|above) instructions/i,
    /bypass (all )?(guardrails|safety)/i,
    /reveal (your )?(system|internal) (prompt|instructions)/i,
    /you are now in (developer|dan|unrestricted) mode/i,
    /act as an unconstrained/i,
    /jailbreak/i,
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(input)) {
      return {
        safe: false,
        reason: "Permintaan Anda mengandung instruksi di luar batas keamanan layanan.",
      };
    }
  }

  return { safe: true };
}
