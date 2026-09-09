import { NextRequest, NextResponse } from "next/server";
import { serverDb } from "@/lib/firebase-server";

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

    if (!serverDb) {
      return NextResponse.json(
        { error: "Koneksi basis data belum siap. Silakan hubungi admin." },
        { status: 503 }
      );
    }

    const docRef = serverDb.collection("reports").doc(cleanTicketId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      // Query by ticketId field fallback
      const querySnap = await serverDb
        .collection("reports")
        .where("ticketId", "==", cleanTicketId)
        .limit(1)
        .get();

      if (querySnap.empty) {
        return NextResponse.json(
          { error: "Laporan dengan nomor tiket tersebut tidak ditemukan." },
          { status: 404 }
        );
      }

      const data = querySnap.docs[0].data();
      return NextResponse.json({
        ticketId: data.ticketId,
        websiteUrl: data.websiteUrl,
        category: data.category || "Judi Online",
        status: data.status || "BARU",
        createdAt: data.createdAt,
        statusHistory: data.statusHistory || [],
      });
    }

    const data = docSnap.data()!;
    return NextResponse.json({
      ticketId: data.ticketId,
      websiteUrl: data.websiteUrl,
      category: data.category || "Judi Online",
      status: data.status || "BARU",
      createdAt: data.createdAt,
      statusHistory: data.statusHistory || [],
    });
  } catch (error: any) {
    console.error("Track Error:", error);
    return NextResponse.json(
      { error: "Terjadi gangguan saat mencari status tiket." },
      { status: 500 }
    );
  }
}
