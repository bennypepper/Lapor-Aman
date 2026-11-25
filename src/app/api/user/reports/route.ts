import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { dbRepo } from "@/db/repo";
import { NO_STORE_HEADERS } from "@/lib/http";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json(
        { error: "Sesi login berakhir. Silakan masuk kembali." },
        { status: 401, headers: NO_STORE_HEADERS }
      );
    }

    const reports = await dbRepo.getReportsByUserId(session.id);

    return NextResponse.json(
      {
        reports: reports.map((r) => ({
          id: r.id,
          ticketId: r.ticketId,
          websiteUrl: r.websiteUrl,
          category: r.category,
          details: r.details,
          status: r.status,
          createdAt: r.createdAt,
          statusHistory: (r.statusHistory || []).map(({ status, timestamp, note }) => ({
            status,
            timestamp,
            note,
          })),
        })),
      },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch (error) {
    console.error("User Reports Fetch Error:", error);
    return NextResponse.json(
      { error: "Gagal memuat riwayat aduan Anda." },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
