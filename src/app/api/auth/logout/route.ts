import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";
import { NO_STORE_HEADERS, verifySameOrigin } from "@/lib/http";

export async function POST(req: NextRequest) {
  const originError = verifySameOrigin(req);
  if (originError) return originError;

  const response = NextResponse.json(
    { success: true, message: "Berhasil keluar dari sesi." },
    { status: 200, headers: NO_STORE_HEADERS }
  );
  clearSessionCookie(response);
  return response;
}
