"use client";

import { useState } from "react";
import { Search, Clock, CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface StatusHistoryItem {
  status: string;
  timestamp: string | number;
  note?: string;
}

interface ReportData {
  ticketId: string;
  websiteUrl: string;
  category: string;
  status: string;
  createdAt: string;
  statusHistory: StatusHistoryItem[];
}

export default function TrackingView() {
  const [ticketQuery, setTicketQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<ReportData | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = ticketQuery.trim();
    if (!cleanId) return;

    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const res = await fetch(`/api/track/${encodeURIComponent(cleanId)}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Laporan tidak ditemukan.");
      } else {
        setReport(data);
      }
    } catch {
      setError("Gagal menghubungi server pelacakan.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SELESAI":
        return {
          bg: "bg-emerald-950/60 border-emerald-800/80 text-emerald-400",
          icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />,
        };
      case "DITOLAK":
        return {
          bg: "bg-rose-950/60 border-rose-800/80 text-rose-400",
          icon: <XCircle className="h-3.5 w-3.5 text-rose-400" />,
        };
      case "DITINDAKLANJUTI":
        return {
          bg: "bg-purple-950/60 border-purple-800/80 text-purple-400",
          icon: <Clock className="h-3.5 w-3.5 text-purple-400" />,
        };
      case "DIVERIFIKASI":
        return {
          bg: "bg-amber-950/60 border-amber-800/80 text-amber-400",
          icon: <Clock className="h-3.5 w-3.5 text-amber-400" />,
        };
      default:
        return {
          bg: "bg-cyan-950/60 border-cyan-800/80 text-cyan-400",
          icon: <Clock className="h-3.5 w-3.5 text-cyan-400" />,
        };
    }
  };

  return (
    <div id="tracking" className="rounded-lg border border-slate-800 bg-[#0c121e] p-6 sm:p-8">
      <div className="mb-6">
        <h2 className="text-lg font-semibold tracking-tight text-white flex items-center gap-2">
          <Search className="h-4 w-4 text-cyan-400" />
          Pelacakan Status Pengaduan
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Masukkan Nomor Tiket resmi Anda untuk memantau proses verifikasi dan tindak lanjut penegakan hukum.
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          type="text"
          value={ticketQuery}
          onChange={(e) => setTicketQuery(e.target.value)}
          placeholder="Contoh: LPR-260322-A9F3K2"
          className="flex-1 rounded-md border border-slate-700 bg-slate-900/80 px-3.5 py-2.5 text-xs font-mono text-white placeholder-slate-500 transition focus:border-cyan-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 rounded-md bg-cyan-600 px-4 py-2.5 text-xs font-medium text-white transition hover:bg-cyan-500 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
          Cek Tiket
        </button>
      </form>

      {error && (
        <div className="flex items-center gap-2 rounded-md border border-rose-900/60 bg-rose-950/30 p-3 text-xs text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {report && (
        <div className="mt-6 rounded-md border border-slate-800 bg-slate-900/40 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">Nomor Tiket</span>
              <p className="text-sm font-mono font-semibold text-white">{report.ticketId}</p>
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">Kategori</span>
              <p className="text-xs font-medium text-slate-300">{report.category}</p>
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">Status Terkini</span>
              <div
                className={`mt-1 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                  getStatusBadge(report.status).bg
                }`}
              >
                {getStatusBadge(report.status).icon}
                <span>{report.status}</span>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">URL Tersangka</span>
            <p className="text-xs font-mono text-cyan-300 mt-0.5 truncate">{report.websiteUrl}</p>
          </div>

          {report.statusHistory && report.statusHistory.length > 0 && (
            <div className="mt-6 border-t border-slate-800 pt-5">
              <h3 className="text-xs font-mono font-medium uppercase tracking-wider text-slate-400 mb-4">
                Riwayat Penanganan
              </h3>
              <div className="relative pl-6 border-l border-slate-800 space-y-6">
                {report.statusHistory.map((item, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[31px] top-0.5 h-3.5 w-3.5 rounded-full border-2 border-slate-900 bg-cyan-500 ring-2 ring-cyan-500/20" />
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-semibold text-slate-200">{item.status}</span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {formatDate(item.timestamp)}
                      </span>
                    </div>
                    {item.note && (
                      <p className="mt-1 text-xs text-slate-400 leading-relaxed bg-slate-950/40 p-2.5 rounded border border-slate-800/60">
                        {item.note}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
