import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbRepo } from "@/db/repo";
import { encryptServerData } from "@/lib/crypto";
import { serverConfig } from "@/lib/config";
import { signSessionToken, attachSessionCookie, SessionUser } from "@/lib/auth";
import { isValidNIK, isValidPhone } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, fullname, nik, phone, address } = body;

    if (!email || !password || !fullname || !nik || !phone || !address) {
      return NextResponse.json(
        { error: "Semua data profil dan identitas wajib diisi." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail.includes("@") || cleanEmail.length < 5) {
      return NextResponse.json({ error: "Format email tidak valid." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Kata sandi minimal harus 6 karakter." },
        { status: 400 }
      );
    }

    if (!isValidNIK(nik)) {
      return NextResponse.json(
        { error: "NIK harus terdiri dari tepat 16 digit angka." },
        { status: 400 }
      );
    }

    if (!isValidPhone(phone)) {
      return NextResponse.json(
        { error: "Nomor telepon/ponsel tidak valid." },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existing = await dbRepo.getUserByEmail(cleanEmail);
    if (existing) {
      return NextResponse.json(
        { error: "Email sudah terdaftar. Silakan masuk menggunakan akun Anda." },
        { status: 409 }
      );
    }

    // Hash password securely with bcrypt
    const passwordHash = await bcrypt.hash(password, 10);

    // Encrypt sensitive PII server-side
    const encryptedNik = encryptServerData(nik.trim());
    const encryptedPhone = encryptServerData(phone.trim());
    const encryptedAddress = encryptServerData(address.trim());

    // Check if email is listed as administrator
    const role = serverConfig.adminEmails.includes(cleanEmail) ? "ADMIN" : "USER";
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

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
      role: user.role as "USER" | "ADMIN",
    };

    const token = await signSessionToken(sessionPayload);

    const response = NextResponse.json({
      success: true,
      user: sessionPayload,
    });

    attachSessionCookie(response, token);
    return response;
  } catch (error: any) {
    console.error("Registration Error:", error);
    return NextResponse.json(
      { error: "Terjadi gangguan sistem saat pendaftaran akun. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
