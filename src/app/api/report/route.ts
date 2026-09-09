import { NextRequest, NextResponse } from "next/server";
import { generateTicketId } from "@/lib/utils";
import { encryptServerData } from "@/lib/crypto";
import { serverConfig } from "@/lib/config";
import { dbRepo } from "@/db/repo";
import { getSessionFromRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      websiteUrl,
      category = "Situs Taruhan / Casino",
      details,
      evidenceUrl = null,
      isAnonymous = false,
      turnstileToken = null,
      reporterName = "Anonim",
      reporterEmail = "",
      reporterPhone = "",
      reporterNik = "",
      reporterAddress = "",
    } = body;

    // Check Turnstile CAPTCHA if secret key is configured
    if (serverConfig.turnstileSecretKey) {
      if (!turnstileToken) {
        return NextResponse.json(
          { error: "Verifikasi CAPTCHA wajib diselesaikan." },
          { status: 400 }
        );
      }

      const verifyFormData = new URLSearchParams();
      verifyFormData.append("secret", serverConfig.turnstileSecretKey);
      verifyFormData.append("response", turnstileToken);

      const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        body: verifyFormData,
      });
      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        return NextResponse.json(
          { error: "Validasi CAPTCHA gagal. Silakan coba kembali." },
          { status: 400 }
        );
      }
    }

    if (!websiteUrl || !details) {
      return NextResponse.json(
        { error: "URL situs dan detail laporan wajib diisi." },
        { status: 400 }
      );
    }

    // Check if citizen is logged in via session cookie
    const session = await getSessionFromRequest(req);
    const userId = session?.id || null;
    const finalEmail = isAnonymous ? "" : (session?.email || reporterEmail || "");
    const finalName = isAnonymous ? "Anonim" : (session?.name || reporterName || "Anonim");

    const ticketId = generateTicketId();
    const reportId = `rep_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    // Encrypt confidential reporter PII using server-side AES-256
    const encryptedPhone = reporterPhone ? encryptServerData(reporterPhone.trim()) : "";
    const encryptedNik = reporterNik ? encryptServerData(reporterNik.trim()) : "";
    const encryptedAddress = reporterAddress ? encryptServerData(reporterAddress.trim()) : "";

    const report = await dbRepo.createReport({
      id: reportId,
      ticketId,
      userId: userId || undefined,
      websiteUrl: websiteUrl.trim(),
      category,
      details: details.trim(),
      evidenceUrl: evidenceUrl || undefined,
      isAnonymous: Boolean(isAnonymous),
      reporterName: finalName,
      reporterEmail: finalEmail,
      encryptedPhone,
      encryptedNik,
      encryptedAddress,
      status: "BARU",
      initialNote: "Laporan berhasil diterima sistem dan mengantre untuk verifikasi.",
    });

    return NextResponse.json({
      success: true,
      ticketId: report.ticketId,
      websiteUrl: report.websiteUrl,
      status: report.status,
      createdAt: report.createdAt,
    });
  } catch (error: any) {
    console.error("Report Submission Error:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan laporan. Silakan coba beberapa saat lagi." },
      { status: 500 }
    );
  }
}
