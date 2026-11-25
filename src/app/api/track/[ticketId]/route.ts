import { NextRequest, NextResponse } from "next/server";
import { dbRepo } from "@/db/repo";
import { checkRateLimit, getClientIp } from "@/lib/rate-limiter";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const ip = getClientIp(req);
    const rate = checkRateLimit(`track:${ip}`, 30, 60 * 1000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: `Terlalu banyak permintaan pelacakan. Coba lagi dalam ${rate.resetSeconds} detik.` },
        { status: 429, headers: { "Retry-After": String(rate.resetSeconds) } }
      );
    }

    const { ticketId } = await params;
    const cleanTicketId = ticketId?.trim().toUpperCase();

    if (!cleanTicketId || cleanTicketId.length > 64) {
      return NextResponse.json({ error: "Nomor tiket tidak valid." }, { status: 400 });
    }

    const report = await dbRepo.getReportByTicketId(cleanTicketId);

    if (!report) {
      return NextResponse.json(
        { error: "Laporan dengan nomor tiket tersebut tidak ditemukan." },
        { status: 404 }
      );
    }

    const publicHistory = (report.statusHistory || []).map(({ status, timestamp, note }) => ({
      status,
      timestamp,
      note,
    }));

    return NextResponse.json({
      ticketId: report.ticketId,
      websiteUrl: report.websiteUrl,
      category: report.category || "Judi Online",
      status: report.status || "BARU",
      createdAt: report.createdAt,
      statusHistory: publicHistory,
    });
  } catch (error) {
    console.error("Track Error:", error);
    return NextResponse.json(
      { error: "Terjadi gangguan saat mencari status tiket." },
      { status: 500 }
    );
  }
}
