import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbRepo } from "@/db/repo";
import {
  signSessionToken,
  attachSessionCookie,
  resolveEffectiveRole,
  SessionUser,
} from "@/lib/auth";
import { checkRateLimitDistributed, getClientIp } from "@/lib/rate-limiter";
import { NO_STORE_HEADERS, parseJsonBody, verifySameOrigin } from "@/lib/http";

// Precomputed valid bcrypt hash used to equalize response time when user is not found
const DUMMY_BCRYPT_HASH = "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

export async function POST(req: NextRequest) {
  try {
    const originError = verifySameOrigin(req);
    if (originError) return originError;

    const ip = getClientIp(req);
    const ipRate = await checkRateLimitDistributed(`login:ip:${ip}`, 10, 60 * 1000);
    if (!ipRate.allowed) {
      return NextResponse.json(
        { error: `Terlalu banyak percobaan masuk. Coba lagi dalam ${ipRate.resetSeconds} detik.` },
        {
          status: 429,
          headers: { ...NO_STORE_HEADERS, "Retry-After": String(ipRate.resetSeconds) },
        }
      );
    }

    const parsed = await parseJsonBody<{ email?: unknown; password?: unknown }>(req);
    if (!parsed.ok) return parsed.response;

    const { email, password } = parsed.data;
    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password ||
      email.length > 255 ||
      password.length > 128
    ) {
      return NextResponse.json(
        { error: "Email dan kata sandi wajib diisi." },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const emailRate = await checkRateLimitDistributed(`login:email:${cleanEmail}`, 10, 60 * 1000);
    if (!emailRate.allowed) {
      return NextResponse.json(
        { error: `Terlalu banyak percobaan masuk untuk akun ini. Coba lagi dalam ${emailRate.resetSeconds} detik.` },
        {
          status: 429,
          headers: { ...NO_STORE_HEADERS, "Retry-After": String(emailRate.resetSeconds) },
        }
      );
    }

    const user = await dbRepo.getUserByEmail(cleanEmail);

    if (!user) {
      await bcrypt.compare(password, DUMMY_BCRYPT_HASH);
      return NextResponse.json(
        { error: "Email atau kata sandi tidak cocok." },
        { status: 401, headers: NO_STORE_HEADERS }
      );
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Email atau kata sandi tidak cocok." },
        { status: 401, headers: NO_STORE_HEADERS }
      );
    }

    const role = resolveEffectiveRole(user.email, user.role);
    const sessionPayload: SessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role,
    };

    const token = await signSessionToken(sessionPayload);

    const response = NextResponse.json(
      { success: true, user: sessionPayload },
      { status: 200, headers: NO_STORE_HEADERS }
    );

    attachSessionCookie(response, token);
    return response;
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { error: "Terjadi gangguan sistem saat masuk. Silakan coba lagi." },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
