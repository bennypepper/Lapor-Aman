import { NextRequest, NextResponse } from "next/server";
import { dbRepo } from "@/db/repo";
import { requireAdminSession } from "@/lib/auth";
import { NO_STORE_HEADERS, parseJsonBody, verifySameOrigin } from "@/lib/http";

const ALLOWED_STATUSES = new Set([
  "BARU",
  "DIVERIFIKASI",
  "DITINDAKLANJUTI",
  "SELESAI",
  "DITOLAK",
]);

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const originError = verifySameOrigin(req);
    if (originError) return originError;

    const auth = await requireAdminSession(req);
    if (auth.error) return auth.error;

    const parsed = await parseJsonBody<{ status?: unknown; note?: unknown }>(req);
    if (!parsed.ok) return parsed.response;

    const { status, note } = parsed.data;
    if (typeof status !== "string" || !ALLOWED_STATUSES.has(status)) {
      return NextResponse.json(
        { error: "Status tidak valid." },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    let cleanNote: string | undefined;
    if (note !== undefined && note !== null && note !== "") {
      if (typeof note !== "string" || note.trim().length > 1000) {
        return NextResponse.json(
          { error: "Catatan status tidak valid (maksimal 1000 karakter)." },
          { status: 400, headers: NO_STORE_HEADERS }
        );
      }
      cleanNote = note.trim();
    }

    const { ticketId } = await params;
    const updated = await dbRepo.updateReportStatus(
      ticketId,
      status,
      cleanNote || `Status diubah menjadi ${status} oleh Tim Verifikator.`,
      auth.user.email
    );

    if (!updated) {
      return NextResponse.json(
        { error: "Laporan tidak ditemukan." },
        { status: 404, headers: NO_STORE_HEADERS }
      );
    }

    return NextResponse.json(
      { success: true, status: updated.status },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch (error) {
    console.error("Admin Status Update Error:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui status laporan." },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
