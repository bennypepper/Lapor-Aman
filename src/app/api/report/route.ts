import { NextRequest, NextResponse } from "next/server";
import { generateTicketId } from "@/lib/utils";
import { encryptServerData } from "@/lib/crypto";
import { serverDb } from "@/lib/firebase-server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      websiteUrl,
      category = "Situs Taruhan / Casino",
      details,
      evidenceUrl = null,
      isAnonymous = false,
      reporterUid = "anonymous",
      reporterEmail = "",
      reporterName = "Anonim",
      reporterPhone = "",
      reporterNik = "",
      reporterAddress = "",
    } = body;

    if (!websiteUrl || !details) {
      return NextResponse.json(
        { error: "URL situs dan detail laporan wajib diisi." },
        { status: 400 }
      );
    }

    const ticketId = generateTicketId();
    const now = new Date();

    // Encrypt confidential reporter PII using server-side AES-256
    const encryptedPhone = reporterPhone ? encryptServerData(reporterPhone) : "";
    const encryptedNik = reporterNik ? encryptServerData(reporterNik) : "";
    const encryptedAddress = reporterAddress ? encryptServerData(reporterAddress) : "";

    const reportDocument = {
      ticketId,
      websiteUrl: websiteUrl.trim(),
      category,
      details: details.trim(),
      evidenceUrl,
      isAnonymous: Boolean(isAnonymous),
      reporterUid,
      reporterEmail: isAnonymous ? "" : reporterEmail,
      reporterName: isAnonymous ? "Anonim" : reporterName,
      encryptedPhone,
      encryptedNik,
      encryptedAddress,
      status: "BARU",
      createdAt: now.toISOString(),
      statusHistory: [
        {
          status: "BARU",
          timestamp: now.toISOString(),
          note: "Laporan berhasil diterima sistem dan mengantre untuk verifikasi.",
        },
      ],
    };

    if (serverDb) {
      await serverDb.collection("reports").doc(ticketId).set(reportDocument);
    } else {
      console.warn("Firestore serverDb unavailable, report logged to stdout in preview mode:", ticketId);
    }

    return NextResponse.json({
      success: true,
      ticketId,
      websiteUrl: reportDocument.websiteUrl,
      status: "BARU",
      createdAt: reportDocument.createdAt,
    });
  } catch (error: any) {
    console.error("Report Submission Error:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan laporan. Silakan coba beberapa saat lagi." },
      { status: 500 }
    );
  }
}
