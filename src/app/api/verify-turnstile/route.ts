import { NextRequest, NextResponse } from "next/server";
import { serverConfig } from "@/lib/config";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ success: false, error: "Token CAPTCHA tidak ditemukan." }, { status: 400 });
    }

    // In development or when TURNSTILE_SECRET_KEY is not yet configured, allow bypass
    if (!serverConfig.turnstileSecretKey) {
      console.warn("TURNSTILE_SECRET_KEY is not set. Bypassing verification for development/preview.");
      return NextResponse.json({ success: true, mode: "bypass-dev" });
    }

    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "";

    const formData = new URLSearchParams();
    formData.append("secret", serverConfig.turnstileSecretKey);
    formData.append("response", token);
    if (ip) formData.append("remoteip", ip);

    const result = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData,
    });

    const outcome = await result.json();

    if (outcome.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: "Validasi CAPTCHA gagal. Silakan coba lagi." }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Turnstile verification error:", error);
    return NextResponse.json({ success: false, error: "Terjadi kesalahan pada verifikasi keamanan." }, { status: 500 });
  }
}
