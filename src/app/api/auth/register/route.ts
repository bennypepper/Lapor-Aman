import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbRepo } from "@/db/repo";
import { encryptServerData } from "@/lib/crypto";
import {
  signSessionToken,
  attachSessionCookie,
  resolveEffectiveRole,
  SessionUser,
} from "@/lib/auth";
import { isValidNIK, isValidPhone } from "@/lib/utils";
import { checkRateLimitDistributed, getClientIp } from "@/lib/rate-limiter";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { NO_STORE_HEADERS, parseJsonBody, verifySameOrigin } from "@/lib/http";

function isDuplicateError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const err = error as { code?: string; cause?: { code?: string } };
  return err.code === "23505" || err.cause?.code === "23505";
}

export async function POST(req: NextRequest) {
  try {
    const originError = verifySameOrigin(req);
    if (originError) return originError;

    const ip = getClientIp(req);
    const rate = await checkRateLimitDistributed(`register:${ip}`, 5, 60 * 1000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: `Terlalu banyak percobaan pendaftaran. Coba lagi dalam ${rate.resetSeconds} detik.` },
        {
          status: 429,
          headers: { ...NO_STORE_HEADERS, "Retry-After": String(rate.resetSeconds) },
        }
      );
    }

    const parsed = await parseJsonBody<{
      email?: unknown;
      password?: unknown;
      fullname?: unknown;
      nik?: unknown;
      phone?: unknown;
      address?: unknown;
      turnstileToken?: unknown;
    }>(req);
    if (!parsed.ok) return parsed.response;

    const { email, password, fullname, nik, phone, address, turnstileToken } = parsed.data;

    const turnstile = await verifyTurnstileToken(turnstileToken, ip);
    if (!turnstile.ok) {
      return NextResponse.json(
        { error: turnstile.error },
        { status: turnstile.status, headers: NO_STORE_HEADERS }
      );
    }

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof fullname !== "string" ||
      typeof nik !== "string" ||
      typeof phone !== "string" ||
      typeof address !== "string" ||
      !email.trim() ||
      !password ||
      !fullname.trim() ||
      !nik.trim() ||
      !phone.trim() ||
      !address.trim()
    ) {
      return NextResponse.json(
        { error: "Semua data profil dan identitas wajib diisi." },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) || cleanEmail.length > 255) {
      return NextResponse.json(
        { error: "Format email tidak valid." },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    if (password.length < 8 || password.length > 72) {
      return NextResponse.json(
        { error: "Kata sandi harus terdiri dari 8 hingga 72 karakter." },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    if (fullname.trim().length > 255 || address.trim().length > 500) {
      return NextResponse.json(
        { error: "Nama lengkap atau alamat melebihi batas panjang karakter." },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    if (!isValidNIK(nik)) {
      return NextResponse.json(
        { error: "NIK harus terdiri dari tepat 16 digit angka." },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    if (!isValidPhone(phone)) {
      return NextResponse.json(
        { error: "Nomor telepon/ponsel tidak valid." },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const existing = await dbRepo.getUserByEmail(cleanEmail);
    if (existing) {
      return NextResponse.json(
        { error: "Email sudah terdaftar. Silakan masuk menggunakan akun Anda." },
        { status: 409, headers: NO_STORE_HEADERS }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const encryptedNik = encryptServerData(nik.trim());
    const encryptedPhone = encryptServerData(phone.trim());
    const encryptedAddress = encryptServerData(address.trim());

    const role = resolveEffectiveRole(cleanEmail, "USER");
    const userId = `usr_${crypto.randomUUID()}`;

    const user = await dbRepo.createUser({
      id: userId,
      email: cleanEmail,
      name: fullname.trim(),
      passwordHash,
      role,
      encryptedNik,
      encryptedPhone,
      encryptedAddress,
    });

    const sessionPayload: SessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: resolveEffectiveRole(user.email, user.role),
    };

    const token = await signSessionToken(sessionPayload);

    const response = NextResponse.json(
      { success: true, user: sessionPayload },
      { status: 200, headers: NO_STORE_HEADERS }
    );

    attachSessionCookie(response, token);
    return response;
  } catch (error) {
    if (isDuplicateError(error)) {
      return NextResponse.json(
        { error: "Email sudah terdaftar. Silakan masuk menggunakan akun Anda." },
        { status: 409, headers: NO_STORE_HEADERS }
      );
    }
    console.error("Registration Error:", error);
    return NextResponse.json(
      { error: "Terjadi gangguan sistem saat pendaftaran akun. Silakan coba lagi." },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
