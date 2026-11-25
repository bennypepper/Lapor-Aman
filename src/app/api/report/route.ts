import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { generateTicketId, isValidNIK, isValidPhone } from "@/lib/utils";
import { encryptServerData } from "@/lib/crypto";
import { dbRepo } from "@/db/repo";
import { getSessionFromRequest } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limiter";
import { verifyTurnstileToken } from "@/lib/turnstile";
import {
  isValidHttpUrl,
  NO_STORE_HEADERS,
  parseJsonBody,
  verifySameOrigin,
} from "@/lib/http";

function isUniqueCollision(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const err = error as { code?: string; cause?: { code?: string } };
  return err.code === "23505" || err.cause?.code === "23505";
}

export async function POST(req: NextRequest) {
  try {
    const originError = verifySameOrigin(req);
    if (originError) return originError;

    const ip = getClientIp(req);
    const rate = checkRateLimit(`report:${ip}`, 10, 60 * 1000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: `Terlalu banyak pengiriman laporan. Coba lagi dalam ${rate.resetSeconds} detik.` },
        {
          status: 429,
          headers: { ...NO_STORE_HEADERS, "Retry-After": String(rate.resetSeconds) },
        }
      );
    }

    const parsed = await parseJsonBody<{
      websiteUrl?: unknown;
      category?: unknown;
      details?: unknown;
      evidenceUrl?: unknown;
      isAnonymous?: unknown;
      turnstileToken?: unknown;
      reporterName?: unknown;
      reporterPhone?: unknown;
      reporterNik?: unknown;
      reporterAddress?: unknown;
    }>(req);
    if (!parsed.ok) return parsed.response;

    const {
      websiteUrl,
      category = "Situs Taruhan / Casino",
      details,
      evidenceUrl = null,
      isAnonymous = false,
      turnstileToken = null,
      reporterName = "Anonim",
      reporterPhone = "",
      reporterNik = "",
      reporterAddress = "",
    } = parsed.data;

    const turnstile = await verifyTurnstileToken(turnstileToken, ip);
    if (!turnstile.ok) {
      return NextResponse.json(
        { error: turnstile.error },
        { status: turnstile.status, headers: NO_STORE_HEADERS }
      );
    }

    if (!isValidHttpUrl(websiteUrl, 2048)) {
      return NextResponse.json(
        { error: "URL situs harus menggunakan protokol http:// atau https:// yang valid (maksimal 2048 karakter)." },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    if (typeof category !== "string" || !category.trim() || category.trim().length > 100) {
      return NextResponse.json(
        { error: "Kategori laporan tidak valid (maksimal 100 karakter)." },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    if (typeof details !== "string" || details.trim().length < 10 || details.trim().length > 5000) {
      return NextResponse.json(
        { error: "Detail laporan harus terdiri dari 10 hingga 5000 karakter." },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    let cleanEvidenceUrl: string | undefined;
    if (evidenceUrl !== null && evidenceUrl !== undefined && evidenceUrl !== "") {
      if (!isValidHttpUrl(evidenceUrl, 2048)) {
        return NextResponse.json(
          { error: "URL bukti harus menggunakan protokol http:// atau https:// yang valid." },
          { status: 400, headers: NO_STORE_HEADERS }
        );
      }
      cleanEvidenceUrl = (evidenceUrl as string).trim();
    }

    const anonymousFlag = Boolean(isAnonymous);

    const phoneStr = typeof reporterPhone === "string" ? reporterPhone.trim() : "";
    const nikStr = typeof reporterNik === "string" ? reporterNik.trim() : "";
    const addressStr = typeof reporterAddress === "string" ? reporterAddress.trim() : "";
    const nameStr = typeof reporterName === "string" ? reporterName.trim() : "";

    if (!anonymousFlag) {
      if (nikStr && !isValidNIK(nikStr)) {
        return NextResponse.json(
          { error: "NIK harus terdiri dari tepat 16 digit angka." },
          { status: 400, headers: NO_STORE_HEADERS }
        );
      }
      if (phoneStr && !isValidPhone(phoneStr)) {
        return NextResponse.json(
          { error: "Nomor telepon/ponsel tidak valid." },
          { status: 400, headers: NO_STORE_HEADERS }
        );
      }
      if (nameStr.length > 255 || addressStr.length > 500) {
        return NextResponse.json(
          { error: "Nama atau alamat pelapor melebihi batas karakter." },
          { status: 400, headers: NO_STORE_HEADERS }
        );
      }
    }

    // Bind identity strictly from verified session cookie (never trust client-supplied reporterEmail)
    const session = await getSessionFromRequest(req);
    const userId = session?.id ?? undefined;
    const finalEmail = anonymousFlag ? "" : session?.email ?? "";
    const finalName = anonymousFlag ? "Anonim" : session?.name || nameStr || "Anonim";

    const encryptedPhone = !anonymousFlag && phoneStr ? encryptServerData(phoneStr) : "";
    const encryptedNik = !anonymousFlag && nikStr ? encryptServerData(nikStr) : "";
    const encryptedAddress = !anonymousFlag && addressStr ? encryptServerData(addressStr) : "";

    const createPayload = () => ({
      id: `rep_${crypto.randomUUID()}`,
      ticketId: generateTicketId(),
      userId,
      websiteUrl: (websiteUrl as string).trim(),
      category: category.trim(),
      details: details.trim(),
      evidenceUrl: cleanEvidenceUrl,
      isAnonymous: anonymousFlag,
      reporterName: finalName,
      reporterEmail: finalEmail,
      encryptedPhone,
      encryptedNik,
      encryptedAddress,
      status: "BARU",
      initialNote: "Laporan berhasil diterima sistem dan mengantre untuk verifikasi.",
    });

    let report;
    try {
      report = await dbRepo.createReport(createPayload());
    } catch (err) {
      if (isUniqueCollision(err)) {
        report = await dbRepo.createReport(createPayload());
      } else {
        throw err;
      }
    }

    return NextResponse.json(
      {
        success: true,
        ticketId: report.ticketId,
        websiteUrl: report.websiteUrl,
        status: report.status,
        createdAt: report.createdAt,
      },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch (error) {
    console.error("Report Submission Error:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan laporan. Silakan coba beberapa saat lagi." },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
