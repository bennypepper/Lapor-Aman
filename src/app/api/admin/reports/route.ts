import { NextRequest, NextResponse } from "next/server";
import { dbRepo } from "@/db/repo";
import { decryptServerData, verifyEncryptionKey } from "@/lib/crypto";
import { requireAdminSession } from "@/lib/auth";
import { NO_STORE_HEADERS } from "@/lib/http";

function parseNonNegativeInt(raw: string | null, fallback: number): number {
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdminSession(req);
    if (auth.error) return auth.error;

    const decryptPass = (req.headers.get("x-decrypt-key") || "").trim();
    let decryptionValid = false;

    if (decryptPass.length > 0) {
      if (!verifyEncryptionKey(decryptPass)) {
        return NextResponse.json(
          { error: "Kunci dekripsi tidak valid.", decryptionValid: false },
          { status: 403, headers: NO_STORE_HEADERS }
        );
      }
      decryptionValid = true;
    }

    const limit = Math.min(500, Math.max(1, parseNonNegativeInt(req.nextUrl.searchParams.get("limit"), 200)));
    const offset = parseNonNegativeInt(req.nextUrl.searchParams.get("offset"), 0);

    const [allReports, total] = await Promise.all([
      dbRepo.getAllReports({ limit, offset }),
      dbRepo.countReports(),
    ]);

    const reports = allReports.map((d) => {
      let decryptedPhone = "";
      let decryptedNik = "";
      let decryptedAddress = "";

      if (decryptionValid) {
        decryptedPhone = decryptServerData(d.encryptedPhone || "");
        decryptedNik = decryptServerData(d.encryptedNik || "");
        decryptedAddress = decryptServerData(d.encryptedAddress || "");
      }

      return {
        id: d.id,
        ticketId: d.ticketId,
        websiteUrl: d.websiteUrl,
        category: d.category,
        details: d.details,
        evidenceUrl: d.evidenceUrl,
        isAnonymous: d.isAnonymous,
        reporterName: d.reporterName,
        reporterEmail: d.reporterEmail,
        status: d.status,
        createdAt: d.createdAt,
        statusHistory: d.statusHistory || [],
        decryptedPhone,
        decryptedNik,
        decryptedAddress,
      };
    });

    return NextResponse.json(
      { reports, decryptionValid, total },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch (error) {
    console.error("Admin Reports Fetch Error:", error);
    return NextResponse.json(
      { error: "Gagal memuat daftar laporan." },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
