import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { serverConfig } from "./server-config";
import { dbRepo } from "@/db/repo";
import { NO_STORE_HEADERS } from "./http";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
}

export const SESSION_COOKIE_NAME = "lapor_aman_session";

function getJwtSecretBytes(): Uint8Array {
  return new TextEncoder().encode(serverConfig.jwtSecret);
}

export function resolveEffectiveRole(email: string, dbRole?: string | null): "USER" | "ADMIN" {
  const normalizedEmail = email.toLowerCase().trim();
  if (dbRole === "ADMIN" || serverConfig.adminEmails.includes(normalizedEmail)) {
    return "ADMIN";
  }
  return "USER";
}

export async function signSessionToken(user: SessionUser): Promise<string> {
  return await new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getJwtSecretBytes());
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getJwtSecretBytes(), {
      algorithms: ["HS256"],
    });
    if (
      typeof payload.id !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.name !== "string"
    ) {
      return null;
    }
    return {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      role: payload.role === "ADMIN" ? "ADMIN" : "USER",
    };
  } catch {
    return null;
  }
}

export async function getSessionFromRequest(req: NextRequest): Promise<SessionUser | null> {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifySessionToken(token);
}

export async function getServerSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

export async function requireAdminSession(
  req: NextRequest
): Promise<{ user: SessionUser; error?: never } | { user?: never; error: NextResponse }> {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return {
      error: NextResponse.json(
        { error: "Sesi tidak valid. Silakan masuk sebagai administrator." },
        { status: 401, headers: NO_STORE_HEADERS }
      ),
    };
  }

  const dbUser = await dbRepo.getUserById(session.id);
  if (!dbUser) {
    return {
      error: NextResponse.json(
        { error: "Sesi tidak valid. Akun tidak ditemukan." },
        { status: 401, headers: NO_STORE_HEADERS }
      ),
    };
  }

  const effectiveRole = resolveEffectiveRole(dbUser.email, dbUser.role);
  if (effectiveRole !== "ADMIN") {
    return {
      error: NextResponse.json(
        { error: "Akses ditolak. Anda bukan administrator." },
        { status: 403, headers: NO_STORE_HEADERS }
      ),
    };
  }

  return {
    user: {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: "ADMIN",
    },
  };
}

export function attachSessionCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
