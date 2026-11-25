import { NextRequest, NextResponse } from "next/server";

export const NO_STORE_HEADERS = {
  "Cache-Control": "no-store",
} as const;

export async function parseJsonBody<T = Record<string, unknown>>(
  req: NextRequest
): Promise<{ ok: true; data: T } | { ok: false; response: NextResponse }> {
  try {
    const parsed: unknown = await req.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {
        ok: false,
        response: NextResponse.json(
          { error: "Format permintaan JSON tidak valid." },
          { status: 400, headers: NO_STORE_HEADERS }
        ),
      };
    }
    return { ok: true, data: parsed as T };
  } catch {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Format permintaan JSON tidak valid." },
        { status: 400, headers: NO_STORE_HEADERS }
      ),
    };
  }
}

export function isValidHttpUrl(raw: unknown, maxLength = 2048): boolean {
  if (typeof raw !== "string") return false;
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > maxLength) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function verifySameOrigin(req: NextRequest): NextResponse | null {
  const origin = req.headers.get("origin");
  if (!origin) return null;

  try {
    const originHost = new URL(origin).host.toLowerCase();
    const requestHost = (req.headers.get("host") || req.nextUrl?.host || "").toLowerCase();
    if (!requestHost || originHost !== requestHost) {
      return NextResponse.json(
        { error: "Permintaan lintas asal tidak diizinkan." },
        { status: 403, headers: NO_STORE_HEADERS }
      );
    }
    return null;
  } catch {
    return NextResponse.json(
      { error: "Header Origin tidak valid." },
      { status: 403, headers: NO_STORE_HEADERS }
    );
  }
}
