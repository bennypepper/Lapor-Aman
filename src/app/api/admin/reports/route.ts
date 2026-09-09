import { NextRequest, NextResponse } from "next/server";
import { serverDb } from "@/lib/firebase-server";
import { serverConfig } from "@/lib/config";
import { decryptServerData } from "@/lib/crypto";

export async function GET(req: NextRequest) {
  try {
    const adminEmail = req.headers.get("x-admin-email")?.toLowerCase().trim();
    const decryptPass = req.headers.get("x-decrypt-key") || "";

    if (!adminEmail || !serverConfig.adminEmails.includes(adminEmail)) {
      return NextResponse.json({ error: "Akses ditolak. Anda bukan administrator." }, { status: 403 });
    }

    if (!serverDb) {
      return NextResponse.json({ reports: [] });
    }

    const snapshot = await serverDb.collection("reports").orderBy("createdAt", "desc").limit(100).get();

    const reports = snapshot.docs.map((doc) => {
      const d = doc.data();
      let decryptedPhone = "";
      let decryptedNik = "";
      let decryptedAddress = "";

      if (decryptPass && decryptPass === serverConfig.serverEncryptionKey) {
        decryptedPhone = decryptServerData(d.encryptedPhone);
        decryptedNik = decryptServerData(d.encryptedNik);
        decryptedAddress = decryptServerData(d.encryptedAddress);
      }

      return {
        id: doc.id,
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
