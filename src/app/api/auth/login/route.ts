import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbRepo } from "@/db/repo";
import { serverConfig } from "@/lib/config";
import { signSessionToken, attachSessionCookie, SessionUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan kata sandi wajib diisi." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await dbRepo.getUserByEmail(cleanEmail);

    if (!user) {
      return NextResponse.json(
        { error: "Email atau kata sandi tidak cocok." },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Email atau kata sandi tidak cocok." },
        { status: 401 }
      );
    }

    // Promote to ADMIN if configured in environment admin emails
    let role = user.role as "USER" | "ADMIN";
    if (serverConfig.adminEmails.includes(cleanEmail) && role !== "ADMIN") {
      role = "ADMIN";
    }

    const sessionPayload: SessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role,
    };

    const token = await signSessionToken(sessionPayload);

    const response = NextResponse.json({
      success: true,
      user: sessionPayload,
    });

    attachSessionCookie(response, token);
    return response;
  } catch (error: any) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { error: "Terjadi gangguan sistem saat masuk. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
