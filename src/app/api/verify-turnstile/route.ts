import { NextRequest, NextResponse } from "next/server";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { checkRateLimit, getClientIp } from "@/lib/rate-limiter";
import { NO_STORE_HEADERS, parseJsonBody } from "@/lib/http";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rate = checkRateLimit(`turnstile:${ip}`, 20, 60 * 1000);
    if (!rate.allowed) {
      return NextResponse.json(
        { success: false, error: `Terlalu banyak permintaan verifikasi. Coba lagi dalam ${rate.resetSeconds} detik.` },
        {
          status: 429,
          headers: { ...NO_STORE_HEADERS, "Retry-After": String(rate.resetSeconds) },
        }
      );
    }

    const parsed = await parseJsonBody<{ token?: unknown }>(req);
    if (!parsed.ok) return parsed.response;

    const result = await verifyTurnstileToken(parsed.data.token, ip);
    if (!result.ok) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.status, headers: NO_STORE_HEADERS }
      );
    }

    return NextResponse.json(
      result.mode ? { success: true, mode: result.mode } : { success: true },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch (error) {
    console.error("Turnstile verification error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan pada verifikasi keamanan." },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
