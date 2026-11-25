import { describe, it, expect, vi, afterEach } from "vitest";
import {
  checkRateLimit,
  getClientIp,
  resetRateLimiter,
} from "@/lib/rate-limiter";
import { verifyTurnstileToken } from "@/lib/turnstile";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
  resetRateLimiter();
  vi.restoreAllMocks();
});

describe("rate-limiter", () => {
  it("isolates buckets by key prefix", () => {
    const ip = "203.0.113.10";
    expect(checkRateLimit(`chat:${ip}`, 2, 60_000).allowed).toBe(true);
    expect(checkRateLimit(`chat:${ip}`, 2, 60_000).allowed).toBe(true);
    expect(checkRateLimit(`chat:${ip}`, 2, 60_000).allowed).toBe(false);

    // Separate bucket for login should still be allowed
    expect(checkRateLimit(`login:${ip}`, 2, 60_000).allowed).toBe(true);
  });

  it("prefers x-vercel-forwarded-for > x-real-ip > x-forwarded-for and ignores cf-connecting-ip", () => {
    const makeReq = (headers: Record<string, string>) => ({
      headers: {
        get: (name: string) => headers[name.toLowerCase()] ?? null,
      },
    });

    expect(
      getClientIp(
        makeReq({
          "cf-connecting-ip": "1.2.3.4",
          "x-vercel-forwarded-for": "198.51.100.1, 10.0.0.1",
          "x-real-ip": "198.51.100.2",
          "x-forwarded-for": "198.51.100.3",
        })
      )
    ).toBe("198.51.100.1");

    expect(
      getClientIp(
        makeReq({
          "cf-connecting-ip": "1.2.3.4",
          "x-real-ip": "198.51.100.2",
          "x-forwarded-for": "198.51.100.3",
        })
      )
    ).toBe("198.51.100.2");

    expect(
      getClientIp(
        makeReq({
          "cf-connecting-ip": "1.2.3.4",
          "x-forwarded-for": "198.51.100.3, 10.0.0.1",
        })
      )
    ).toBe("198.51.100.3");

    // Only spoofable cf-connecting-ip -> ignored, falls back to 127.0.0.1
    expect(
      getClientIp(
        makeReq({
          "cf-connecting-ip": "1.2.3.4",
        })
      )
    ).toBe("127.0.0.1");
  });

  it("enforces max map capacity without throwing", () => {
    for (let i = 0; i < 10_050; i++) {
      const res = checkRateLimit(`cap:ip-${i}`, 5, 60_000);
      expect(res.allowed).toBe(true);
    }
  });
});

describe("turnstile verification", () => {
  it("fails closed with 503 in production when TURNSTILE_SECRET_KEY is unset", async () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = "production";
    delete process.env.TURNSTILE_SECRET_KEY;

    const result = await verifyTurnstileToken("some-token", "203.0.113.5");
    expect(result.ok).toBe(false);
    expect(result.status).toBe(503);
  });

  it("returns 400 when secret is set and token is missing", async () => {
    process.env.TURNSTILE_SECRET_KEY = "test-secret";
    const result = await verifyTurnstileToken("", "203.0.113.5");
    expect(result.ok).toBe(false);
    expect(result.status).toBe(400);
  });

  it("returns 503 when Cloudflare Turnstile request times out or rejects", async () => {
    process.env.TURNSTILE_SECRET_KEY = "test-secret";
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new DOMException("Aborted", "TimeoutError"));

    const result = await verifyTurnstileToken("valid-token", "203.0.113.5");
    expect(result.ok).toBe(false);
    expect(result.status).toBe(503);
  });

  it("validates allowed hostnames when ALLOWED_TURNSTILE_HOSTNAMES is configured", async () => {
    process.env.TURNSTILE_SECRET_KEY = "test-secret";
    process.env.ALLOWED_TURNSTILE_HOSTNAMES = "lapor-aman.vercel.app";

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true, hostname: "evil.example.com" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    const rejected = await verifyTurnstileToken("valid-token", "203.0.113.5");
    expect(rejected.ok).toBe(false);
    expect(rejected.status).toBe(400);

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true, hostname: "lapor-aman.vercel.app" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    const accepted = await verifyTurnstileToken("valid-token", "203.0.113.5");
    expect(accepted.ok).toBe(true);
  });
});
