interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const MAX_STORE_ENTRIES = 10_000;
const ipStore = new Map<string, RateLimitEntry>();

// Periodic cleanup of stale entries every 5 minutes (unref'd so it never blocks shutdown)
if (typeof setInterval !== "undefined") {
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of ipStore.entries()) {
      if (entry.resetAt < now) {
        ipStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
  if (typeof timer.unref === "function") {
    timer.unref();
  }
}

export function resetRateLimiter(): void {
  ipStore.clear();
}

export function getClientIp(req: { headers: { get(name: string): string | null } }): string {
  const vercelForwarded = req.headers.get("x-vercel-forwarded-for");
  if (vercelForwarded) {
    const first = vercelForwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  return "127.0.0.1";
}

function evictIfNeeded(now: number): void {
  if (ipStore.size < MAX_STORE_ENTRIES) return;
  for (const [k, v] of ipStore.entries()) {
    if (v.resetAt < now) {
      ipStore.delete(k);
    }
    if (ipStore.size < MAX_STORE_ENTRIES) return;
  }
  const oldestKey = ipStore.keys().next().value;
  if (oldestKey !== undefined) {
    ipStore.delete(oldestKey);
  }
}

/**
 * Checks if a given rate-limit bucket key is within its request quota.
 */
export function checkRateLimit(
  key: string,
  maxRequests: number = 6,
  windowMs: number = 60 * 1000
): { allowed: boolean; remaining: number; resetSeconds: number } {
  const now = Date.now();
  const cleanKey = key || "unknown_key";
  const entry = ipStore.get(cleanKey);

  if (!entry || entry.resetAt < now) {
    if (!entry) {
      evictIfNeeded(now);
    }
    ipStore.set(cleanKey, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      allowed: true,
      remaining: Math.max(0, maxRequests - 1),
      resetSeconds: Math.ceil(windowMs / 1000),
    };
  }

  if (entry.count >= maxRequests) {
    const resetSeconds = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
    return { allowed: false, remaining: 0, resetSeconds };
  }

  entry.count += 1;
  const resetSeconds = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
  return { allowed: true, remaining: Math.max(0, maxRequests - entry.count), resetSeconds };
}

/**
 * Basic guardrail filter to detect and neutralize prompt injection attempts.
 */
export function checkPromptSafety(input: string): { safe: boolean; reason?: string } {
  if (input.length > 1000) {
    return { safe: false, reason: "Pesan terlalu panjang (maksimal 1000 karakter)." };
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
