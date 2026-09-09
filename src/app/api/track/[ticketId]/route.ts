import { NextRequest, NextResponse } from "next/server";
import { dbRepo } from "@/db/repo";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const { ticketId } = await params;
    const cleanTicketId = ticketId?.trim().toUpperCase();

    if (!cleanTicketId) {
      return NextResponse.json({ error: "Nomor tiket tidak valid." }, { status: 400 });
    }

    const report = await dbRepo.getReportByTicketId(cleanTicketId);

    if (!report) {
      return NextResponse.json(
        { error: "Laporan dengan nomor tiket tersebut tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ticketId: report.ticketId,
      websiteUrl: report.websiteUrl,
      category: report.category || "Judi Online",
      status: report.status || "BARU",
      createdAt: report.createdAt,
      statusHistory: report.statusHistory || [],
    });
  } catch (error: any) {
    console.error("Track Error:", error);
    return NextResponse.json(
      { error: "Terjadi gangguan saat mencari status tiket." },
      { status: 500 }
    );
  }
}
