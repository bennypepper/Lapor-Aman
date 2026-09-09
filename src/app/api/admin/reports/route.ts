import { NextRequest, NextResponse } from "next/server";
import { dbRepo } from "@/db/repo";
import { serverConfig } from "@/lib/config";
import { decryptServerData } from "@/lib/crypto";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    const adminEmailHeader = req.headers.get("x-admin-email")?.toLowerCase().trim();
    const decryptPass = req.headers.get("x-decrypt-key") || "";

    const isAdminSession = session?.role === "ADMIN";
    const isAdminHeader = adminEmailHeader && serverConfig.adminEmails.includes(adminEmailHeader);

    if (!isAdminSession && !isAdminHeader) {
      return NextResponse.json(
        { error: "Akses ditolak. Anda bukan administrator." },
        { status: 403 }
      );
    }

    const allReports = await dbRepo.getAllReports();

    const reports = allReports.map((d) => {
      let decryptedPhone = "";
      let decryptedNik = "";
      let decryptedAddress = "";

      if (decryptPass && decryptPass === serverConfig.serverEncryptionKey) {
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

    return NextResponse.json({ reports });
  } catch (error: any) {
    console.error("Admin Reports Fetch Error:", error);
    return NextResponse.json({ error: "Gagal memuat daftar laporan." }, { status: 500 });
  }
}
