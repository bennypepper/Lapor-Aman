import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { dbRepo } from "@/db/repo";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json(
        { error: "Sesi login berakhir. Silakan masuk kembali." },
        { status: 401 }
      );
    }

    const reports = await dbRepo.getReportsByUserEmail(session.email);

    return NextResponse.json({
      reports: reports.map((r) => ({
        id: r.id,
        ticketId: r.ticketId,
        websiteUrl: r.websiteUrl,
        category: r.category,
        details: r.details,
        status: r.status,
        createdAt: r.createdAt,
        statusHistory: r.statusHistory || [],
      })),
    });
  } catch (error: any) {
    console.error("User Reports Fetch Error:", error);
    return NextResponse.json(
      { error: "Gagal memuat riwayat aduan Anda." },
      { status: 500 }
    );
  }
}
