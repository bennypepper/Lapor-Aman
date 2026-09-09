"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  Upload,
  FileCheck,
  Download,
  AlertCircle,
  CheckCircle,
  ShieldCheck,
  Copy,
  Check,
  UserCheck,
} from "lucide-react";
import jsPDF from "jspdf";
import { toast } from "sonner";
import { clientConfig } from "@/lib/config";

interface ReportFormProps {
  user: any;
  onSuccess?: (ticketId: string) => void;
}

export default function ReportForm({ user, onSuccess }: ReportFormProps) {
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [category, setCategory] = useState("Situs Taruhan / Casino Online");
  const [details, setDetails] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [successData, setSuccessData] = useState<{
    ticketId: string;
    websiteUrl: string;
    createdAt: string;
  } | null>(null);

  const [turnstileActivated, setTurnstileActivated] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  // Activate Turnstile only when user fills mandatory fields (URL & details)
  const isFormFilled = websiteUrl.trim().length >= 3 && details.trim().length >= 5;

  useEffect(() => {
    if (isFormFilled && !turnstileActivated) {
      setTurnstileActivated(true);
    }
  }, [isFormFilled, turnstileActivated]);

  // Mount Turnstile widget smoothly once activated
  useEffect(() => {
    if (!turnstileActivated) return;

    let timer: NodeJS.Timeout | null = null;
    let isMounted = true;

    const renderTurnstile = () => {
      if (!isMounted) return;
      const turnstile = (window as any).turnstile;
      const container = turnstileContainerRef.current;

      if (turnstile && container) {
        if (widgetIdRef.current || container.children.length > 0) return;

        try {
          const sitekey = (clientConfig.turnstileSiteKey || "0x4AAAAAAB8Es5v_tBV9BFWn").trim();
          const id = turnstile.render(container, {
            sitekey,
            theme: "dark",
            callback: (token: string) => {
              if (isMounted) setTurnstileToken(token);
            },
            "error-callback": (err: any) => {
              console.warn("Cloudflare Turnstile error on current hostname:", err);
            },
            "expired-callback": () => {
              if (isMounted) setTurnstileToken(null);
            },
          });
          widgetIdRef.current = id;
        } catch (err) {
          console.error("Turnstile render error:", err);
        }
      }
    };

    if (typeof window !== "undefined" && (window as any).turnstile) {
      renderTurnstile();
    } else {
      timer = setInterval(() => {
        if (typeof window !== "undefined" && (window as any).turnstile) {
          renderTurnstile();
          if (timer) clearInterval(timer);
        }
      }, 150);
    }

    return () => {
      isMounted = false;
      if (timer) clearInterval(timer);
    };
  }, [turnstileActivated]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.size > 5 * 1024 * 1024) {
        setError("Ukuran bukti tangkapan layar maksimal 5MB.");
        return;
      }
      setFile(selected);
      setError(null);
    }
  };

  const handleCopyTicket = (ticketId: string) => {
    navigator.clipboard.writeText(ticketId);
    setCopied(true);
    toast.success("Nomor tiket berhasil disalin ke clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadPdf = (ticketId: string, siteUrl: string, desc: string) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Navy border
    doc.setLineWidth(1.2);
    doc.setDrawColor(15, 23, 42);
    doc.rect(8, 8, pageWidth - 16, doc.internal.pageSize.getHeight() - 16);

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(15, 23, 42);
    doc.text("Lapor-Aman", pageWidth / 2, 26, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text("Platform Pengaduan Resmi Aktivitas Judi Online Indonesia", pageWidth / 2, 33, { align: "center" });
    doc.text("Tanda Terima Laporan Terverifikasi", pageWidth / 2, 38, { align: "center" });

    // Divider
    doc.setLineWidth(0.4);
    doc.setDrawColor(203, 213, 225);
    doc.line(16, 45, pageWidth - 16, 45);

    // Ticket Box
    doc.setFillColor(241, 245, 249);
    doc.rect(16, 52, pageWidth - 32, 22, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text("NOMOR TIKET LAPORAN:", 22, 61);
    doc.setFontSize(14);
    doc.setTextColor(14, 116, 144);
    doc.text(ticketId, 22, 69);

    // Metadata
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);

    let y = 88;
    const addRow = (label: string, value: string) => {
      doc.setFont("helvetica", "bold");
      doc.text(label, 20, y);
      doc.setFont("helvetica", "normal");
      doc.text(value, 60, y);
      y += 10;
    };

    addRow("Waktu Masuk:", new Date().toLocaleString("id-ID"));
    addRow("Kategori:", category);
    addRow("Situs Dilaporkan:", siteUrl);
    addRow("Identitas:", isAnonymous ? "Anonim (Dilindungi)" : user?.email || "Warga Terverifikasi");

    y += 5;
    doc.setFont("helvetica", "bold");
    doc.text("Ringkasan Laporan:", 20, y);
    y += 7;
    doc.setFont("helvetica", "normal");
    const splitDetails = doc.splitTextToSize(desc, pageWidth - 40);
    doc.text(splitDetails, 20, y);

    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 25;
    doc.setLineWidth(0.3);
    doc.line(16, footerY - 5, pageWidth - 16, footerY - 5);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text("Bukti tanda terima ini sah secara elektronik sesuai regulasi digital.", 20, footerY);
    doc.text(`Dicetak: ${new Date().toISOString()}`, pageWidth - 20, footerY, { align: "right" });

    doc.save(`Tanda_Terima_${ticketId}.pdf`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!websiteUrl.trim() || !details.trim()) {
      setError("Mohon lengkapi URL website dan deskripsi temuan.");
      return;
    }

    if (!turnstileToken) {
      setError("Silakan selesaikan verifikasi keamanan CAPTCHA terlebih dahulu.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          websiteUrl,
          category,
          details,
          isAnonymous,
          turnstileToken,
          reporterEmail: user?.email || "",
          reporterName: isAnonymous ? "Anonim" : user?.name || user?.email?.split("@")[0] || "Pelapor",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal mengirim laporan.");
      }

      setSuccessData({
        ticketId: data.ticketId,
        websiteUrl: data.websiteUrl,
        createdAt: data.createdAt,
      });

      toast.success("Laporan berhasil dikirim!");
      if (onSuccess) onSuccess(data.ticketId);

      // Clear form inputs and reset turnstile
      setWebsiteUrl("");
      setDetails("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setTurnstileActivated(false);
      setTurnstileToken(null);
      if (widgetIdRef.current && typeof window !== "undefined" && (window as any).turnstile) {
        try {
          (window as any).turnstile.remove(widgetIdRef.current);
        } catch {}
        widgetIdRef.current = null;
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan sistem saat mengirim laporan.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="lapor" className="rounded-lg border border-slate-800 bg-[#0c121e] p-6 sm:p-8">
      <div className="mb-6">
        <h2 className="text-lg font-semibold tracking-tight text-white flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-cyan-400" />
          Formulir Pengaduan Situs Judi Online
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Laporkan tautan situs perjudian, iklan sponsor ilegal, atau rekening bandar. Identitas Anda dienkripsi secara server-side (AES-256).
        </p>
      </div>

      {user && !successData && (
        <div className="mb-5 flex items-center gap-2 rounded-md border border-cyan-900/40 bg-cyan-950/20 p-3 text-xs text-cyan-300">
          <UserCheck className="h-4 w-4 shrink-0 text-cyan-400" />
          <span>
            Masuk sebagai <strong>{user.name || user.email}</strong>. Laporan ini akan otomatis tercatat pada riwayat akun Anda.
          </span>
        </div>
      )}

      {successData ? (
        <div className="rounded-md border border-emerald-900/60 bg-emerald-950/30 p-6 text-center">
          <CheckCircle className="mx-auto h-10 w-10 text-emerald-400 mb-3" />
          <h3 className="text-base font-semibold text-white">Laporan Berhasil Disimpan</h3>
          <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">
            Terima kasih atas partisipasi Anda. Laporan telah masuk ke antrean verifikasi dan segera ditindaklanjuti.
          </p>

          {/* Ticket ID Display with 1-Click Copy */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <div className="rounded-md border border-slate-800 bg-slate-900 px-4 py-2 font-mono text-sm text-cyan-300 font-bold">
              {successData.ticketId}
            </div>
            <button
              type="button"
              onClick={() => handleCopyTicket(successData.ticketId)}
              className="flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition"
              title="Salin Nomor Tiket"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
              <span>{copied ? "Tersalin!" : "Salin Tiket"}</span>
            </button>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => handleDownloadPdf(successData.ticketId, successData.websiteUrl, details || "Laporan Judi Online")}
              className="flex items-center gap-2 rounded-md bg-cyan-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-cyan-500"
            >
              <Download className="h-3.5 w-3.5" />
              Unduh Tanda Terima PDF
            </button>
            <button
              onClick={() => {
                setSuccessData(null);
                setTurnstileActivated(false);
                setTurnstileToken(null);
                widgetIdRef.current = null;
              }}
              className="rounded-md border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-medium text-slate-300 hover:text-white transition"
            >
              Kirim Laporan Lain
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-md border border-rose-900/60 bg-rose-950/30 p-3 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              URL / Tautan Situs yang Dilaporkan <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://situs-tersangka.com atau nama domain"
              className="w-full rounded-md border border-slate-700 bg-slate-900/80 px-3.5 py-2 text-xs font-mono text-white placeholder-slate-500 transition focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Kategori Pelanggaran</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs text-slate-200 transition focus:border-cyan-500"
              >
                <option>Situs Taruhan / Casino Online</option>
                <option>Slot Gacor / Game Ilegal</option>
                <option>Iklan Sponsor / Endorsement Medsos</option>
                <option>Rekening Bank / E-Wallet Bandar</option>
                <option>Aplikasi APK Judi Mobile</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Bukti Tangkapan Layar (Opsional)</label>
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-slate-700 bg-slate-900/50 px-3 py-1.5 text-xs text-slate-400 hover:border-slate-500 hover:text-slate-200 transition"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span className="truncate">{file ? file.name : "Pilih gambar (Max 5MB)"}</span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Deskripsi Kronologi & Temuan <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Jelaskan bagaimana Anda menemukan situs ini, nomor rekening yang tertera, atau modus promosi yang digunakan..."
              className="w-full rounded-md border border-slate-700 bg-slate-900/80 p-3 text-xs text-white placeholder-slate-500 transition focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-2 py-1">
            <input
              type="checkbox"
              id="anon-check"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-600 focus:ring-cyan-500 focus:ring-offset-slate-950"
            />
            <label htmlFor="anon-check" className="text-xs text-slate-300 cursor-pointer select-none">
              Kirim sebagai <span className="font-semibold text-cyan-400">Laporan Anonim</span> (nama dan kontak dirahasiakan total)
            </label>
          </div>

          {/* Cloudflare Turnstile CAPTCHA (Lazy-Loaded with Skeleton Placeholder) */}
          <div className="pt-2 pb-1">
            {!turnstileActivated ? (
              <div className="rounded-md border border-slate-800/80 bg-slate-900/40 px-4 py-3 min-h-[65px] flex items-center justify-between gap-3 text-slate-400 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                    <ShieldCheck className="h-4 w-4 text-cyan-500/70" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-300">Verifikasi Keamanan CAPTCHA</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">Cloudflare</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Lengkapi URL dan deskripsi temuan di atas untuk memicu verifikasi keamanan.
                    </p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-slate-600" />
                  <span className="text-[11px] text-slate-500 font-mono">Menunggu Form</span>
                </div>
              </div>
            ) : (
              <div className="rounded-md border border-slate-800 bg-slate-900/40 p-2 min-h-[65px] flex flex-col items-center justify-center transition-all duration-300">
                <div
                  ref={turnstileContainerRef}
                  className="min-h-[65px] w-full flex items-center justify-center"
                />
                {!turnstileToken && (
                  <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
                    Memproses tantangan keamanan Cloudflare...
                  </p>
                )}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-cyan-600 px-5 py-2.5 text-xs font-medium text-white shadow-sm transition hover:bg-cyan-500 disabled:opacity-50"
          >
            {submitting ? (
              <FileCheck className="h-3.5 w-3.5 animate-pulse" />
            ) : (
              <Send className="h-3.5 w-3.5 stroke-[2]" />
            )}
            {submitting ? "Memproses Laporan..." : "Kirim Pengaduan Resmi"}
          </button>
        </form>
      )}
    </div>
  );
}
