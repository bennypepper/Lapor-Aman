import { NextRequest, NextResponse } from "next/server";
import { dbRepo } from "@/db/repo";
import { serverConfig } from "@/lib/config";
import { getSessionFromRequest } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const session = await getSessionFromRequest(req);
    const adminEmailHeader = req.headers.get("x-admin-email")?.toLowerCase().trim();

    const isAdminSession = session?.role === "ADMIN";
    const isAdminHeader = adminEmailHeader && serverConfig.adminEmails.includes(adminEmailHeader);

    if (!isAdminSession && !isAdminHeader) {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
    }

    const adminActor = session?.email || adminEmailHeader || "Administrator";

    const { ticketId } = await params;
    const body = await req.json();
    const { status, note } = body;

    const allowedStatuses = ["BARU", "DIVERIFIKASI", "DITINDAKLANJUTI", "SELESAI", "DITOLAK"];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ error: "Status tidak valid." }, { status: 400 });
    }

    const updated = await dbRepo.updateReportStatus(
      ticketId,
      status,
      note || `Status diubah menjadi ${status} oleh ${adminActor}.`,
      adminActor
    );

    if (!updated) {
      return NextResponse.json({ error: "Laporan tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({ success: true, status: updated.status });
  } catch (error: any) {
    console.error("Admin Status Update Error:", error);
    return NextResponse.json({ error: "Gagal memperbarui status laporan." }, { status: 500 });
  }
}
