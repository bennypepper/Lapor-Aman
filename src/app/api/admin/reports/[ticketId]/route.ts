import { NextRequest, NextResponse } from "next/server";
import { serverDb } from "@/lib/firebase-server";
import { serverConfig } from "@/lib/config";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const adminEmail = req.headers.get("x-admin-email")?.toLowerCase().trim();
    if (!adminEmail || !serverConfig.adminEmails.includes(adminEmail)) {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
    }

    const { ticketId } = await params;
    const body = await req.json();
    const { status, note } = body;

    const allowedStatuses = ["BARU", "DIVERIFIKASI", "DITINDAKLANJUTI", "SELESAI", "DITOLAK"];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ error: "Status tidak valid." }, { status: 400 });
    }

    if (!serverDb) {
      return NextResponse.json({ error: "Database tidak terhubung." }, { status: 503 });
    }

    const docRef = serverDb.collection("reports").doc(ticketId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: "Laporan tidak ditemukan." }, { status: 404 });
    }

    const currentHistory = docSnap.data()?.statusHistory || [];
    const newHistoryItem = {
      status,
      timestamp: new Date().toISOString(),
      note: note || `Status diubah menjadi ${status} oleh administrator.`,
      updatedBy: adminEmail,
    };

    await docRef.update({
      status,
      statusHistory: [...currentHistory, newHistoryItem],
    });

    return NextResponse.json({ success: true, status });
  } catch (error: any) {
    console.error("Admin Status Update Error:", error);
    return NextResponse.json({ error: "Gagal memperbarui status laporan." }, { status: 500 });
  }
}
