"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReportForm from "@/components/ReportForm";
import TrackingView from "@/components/TrackingView";
import AuthModal from "@/components/AuthModal";
import FAQSection from "@/components/FAQSection";
import ScrollToTop from "@/components/ScrollToTop";
import Image from "next/image";
import {
  Lock,
  EyeOff,
  CheckCircle2,
  ArrowRight,
  History,
  ExternalLink,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

const ChatDrawer = dynamic(() => import("@/components/ChatDrawer"), { ssr: false });

export interface UserReportSummary {
  id: string;
  ticketId: string;
  websiteUrl: string;
  category: string;
  details: string;
  status: string;
  createdAt: string;
}

export interface ClientSessionUser {
  id?: string;
  email: string;
  name?: string | null;
  role?: string;
}

interface HomeClientProps {
  initialUser: ClientSessionUser | null;
  initialReports: UserReportSummary[];
}

export default function HomeClient({ initialUser, initialReports }: HomeClientProps) {
  const [user, setUser] = useState<ClientSessionUser | null>(initialUser);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [userReports, setUserReports] = useState<UserReportSummary[]>(initialReports);
  const [loadingReports, setLoadingReports] = useState(false);
  const [copiedTicket, setCopiedTicket] = useState<string | null>(null);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const fetchUserReports = useCallback(async () => {
    setLoadingReports(true);
    try {
      const res = await fetch("/api/user/reports");
      if (res.ok) {
        const data = await res.json();
        setUserReports(data.reports || []);
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Gagal memuat riwayat laporan Anda.");
      }
    } catch {
      toast.error("Gagal terhubung ke server untuk memuat riwayat laporan.");
    } finally {
      setLoadingReports(false);
    }
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setUserReports([]);
      toast.success("Anda berhasil keluar dari sesi.");
    } catch {
      toast.error("Gagal keluar dari sesi.");
    }
  };

  const handleCopyTicket = (ticketId: string) => {
    navigator.clipboard.writeText(ticketId);
    setCopiedTicket(ticketId);
    toast.success("Nomor tiket disalin!");
    setTimeout(() => setCopiedTicket(null), 2000);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "SELESAI":
        return "bg-emerald-950/80 text-emerald-300 border-emerald-800";
      case "DITOLAK":
        return "bg-rose-950/80 text-rose-300 border-rose-800";
      case "DITINDAKLANJUTI":
        return "bg-purple-950/80 text-purple-300 border-purple-800";
      case "DIVERIFIKASI":
        return "bg-amber-950/80 text-amber-300 border-amber-800";
      default:
        return "bg-cyan-950/80 text-cyan-300 border-cyan-800";
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#070b12]">
      <Navbar
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      <main className="flex-1">
        {/* Hero Section */}
        <section id="hero" className="border-b border-slate-800/80 bg-gradient-to-b from-[#0c1322] to-[#070b12] py-14 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3 py-1 text-xs font-medium text-cyan-300 mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Sistem Pengaduan Terenkripsi v2.0
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl max-w-3xl leading-[1.15]">
              Laporkan Situs Judi Online. <br />
              <span className="text-cyan-400">Lindungi Ruang Digital Bersama.</span>
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-base">
              Platform partisipasi publik resmi untuk melaporkan link perjudian ilegal, iklan endorsement medsos, dan rekening perantara bandar. Data Anda dienkripsi penuh di sisi server untuk jaminan anonimitas mutlak.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#lapor"
                className="flex items-center gap-2 rounded-md bg-cyan-600 px-5 py-2.5 text-xs font-medium text-white shadow-sm transition hover:bg-cyan-500"
              >
                Buat Laporan Sekarang
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
              <a
                href="#tracking"
                className="flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900/80 px-5 py-2.5 text-xs font-medium text-slate-300 transition hover:border-slate-600 hover:text-white"
              >
                Lacak Status Aduan
              </a>
              {user && (
                <a
                  href="#riwayat"
                  className="flex items-center gap-2 rounded-md border border-cyan-700/60 bg-cyan-950/40 px-5 py-2.5 text-xs font-medium text-cyan-300 transition hover:bg-cyan-900/50"
                >
                  <History className="h-3.5 w-3.5" />
                  Riwayat Laporan Saya ({userReports.length})
                </a>
              )}
            </div>

            {/* Trust Badges */}
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-800/80 pt-8">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-800 bg-slate-900 text-cyan-400">
                  <Lock className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Enkripsi Server-Side</h4>
                  <p className="text-[11px] text-slate-400">PII dilindungi algoritma AES-256-GCM</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-800 bg-slate-900 text-cyan-400">
                  <EyeOff className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Opsi Mode Anonim</h4>
                  <p className="text-[11px] text-slate-400">Laporkan tanpa mencantumkan identitas</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-800 bg-slate-900 text-cyan-400">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Tanda Terima PDF Sah</h4>
                  <p className="text-[11px] text-slate-400">Unduh bukti nomor tiket instan</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trusted Partners Section */}
        <section className="border-y border-slate-800/60 bg-slate-900/30 py-8">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-slate-400">
                Didukung penuh oleh instansi resmi:
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Sinergi PT. Meridian Digital bersama otoritas penegak hukum dan regulasi siber Republik Indonesia
              </p>
            </div>
            <div className="flex items-center gap-8 sm:gap-12">
              <a
                href="https://www.komdigi.go.id/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 opacity-75 hover:opacity-100 transition-opacity"
              >
                <div className="h-10 w-12 relative flex items-center justify-center">
                  <Image
                    src="/assets/img/logo-komdigi.png"
                    alt="Logo Komdigi"
                    width={48}
                    height={40}
                    className="h-9 w-auto object-contain grayscale group-hover:grayscale-0 transition-all"
                  />
                </div>
                <div className="text-left">
                  <span className="block text-xs font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors">
                    Komdigi RI
                  </span>
                  <span className="block text-[10px] text-slate-500 font-mono">Kementerian Komunikasi & Digital</span>
                </div>
              </a>
              <a
                href="https://polri.go.id/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 opacity-75 hover:opacity-100 transition-opacity"
              >
                <div className="h-10 w-10 relative flex items-center justify-center">
                  <Image
                    src="/assets/img/logo-polri.png"
                    alt="Logo POLRI"
                    width={40}
                    height={40}
                    className="h-9 w-auto object-contain grayscale group-hover:grayscale-0 transition-all"
                  />
                </div>
                <div className="text-left">
                  <span className="block text-xs font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors">
                    POLRI Cyber
                  </span>
                  <span className="block text-[10px] text-slate-500 font-mono">Bareskrim Polri</span>
                </div>
              </a>
            </div>
          </div>
        </section>

        {/* Content Section: Form & Tracking */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 space-y-12">
            <ReportForm
              user={user}
              onSuccess={() => {
                if (user) fetchUserReports();
              }}
            />

            <TrackingView
              key={selectedTicketId ?? "manual"}
              selectedTicketId={selectedTicketId}
            />

            {/* Logged-In User Reports History */}
            {user && (
              <div id="riwayat" className="rounded-lg border border-slate-800 bg-[#0c121e] p-6 sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight text-white flex items-center gap-2">
                      <History className="h-4 w-4 text-cyan-400" />
                      Riwayat Laporan Aduan Saya
                    </h2>
                    <p className="mt-1 text-xs text-slate-400">
                      Daftar seluruh laporan yang Anda kirimkan menggunakan akun terverifikasi.
                    </p>
                  </div>
                  <button
                    onClick={fetchUserReports}
                    disabled={loadingReports}
                    className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 hover:text-white transition"
                  >
                    {loadingReports ? "Memperbarui..." : "Segarkan Data"}
                  </button>
                </div>

                {loadingReports ? (
                  <div className="flex items-center justify-center py-10 text-slate-400 gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
                    <span className="text-xs">Memuat riwayat pengaduan Anda...</span>
                  </div>
                ) : userReports.length === 0 ? (
                  <div className="rounded-md border border-slate-800 bg-slate-900/30 p-8 text-center text-xs text-slate-400">
                    Anda belum mengirimkan laporan dengan akun ini. Buat aduan baru menggunakan formulir di atas.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-slate-800">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-slate-800 bg-slate-900/70 font-mono text-[11px] text-slate-400 uppercase">
                        <tr>
                          <th className="px-4 py-3">Nomor Tiket</th>
                          <th className="px-4 py-3">Tanggal</th>
                          <th className="px-4 py-3">Target Situs</th>
                          <th className="px-4 py-3">Kategori</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80">
                        {userReports.map((r) => (
                          <tr key={r.ticketId} className="hover:bg-slate-900/30 transition">
                            <td className="px-4 py-3 font-mono font-medium text-cyan-400">
                              <div className="flex items-center gap-1.5">
                                <span>{r.ticketId}</span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyTicket(r.ticketId)}
                                  className="text-slate-500 hover:text-cyan-300 transition"
                                  title="Salin Nomor Tiket"
                                >
                                  {copiedTicket === r.ticketId ? (
                                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                                  ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                  )}
                                </button>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-slate-400">{formatDate(r.createdAt)}</td>
                            <td className="px-4 py-3 font-mono text-slate-200 max-w-[200px] truncate" title={r.websiteUrl}>
                              {r.websiteUrl}
                            </td>
                            <td className="px-4 py-3 text-slate-300">{r.category}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${getStatusBadgeClass(
                                  r.status
                                )}`}
                              >
                                {r.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <a
                                href="#tracking"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setSelectedTicketId(r.ticketId);
                                  document
                                    .getElementById("tracking")
                                    ?.scrollIntoView({ behavior: "smooth" });
                                }}
                                className="inline-flex items-center gap-1 rounded border border-slate-700 bg-slate-800 px-2 py-1 text-[11px] text-cyan-300 hover:bg-slate-700 hover:text-white transition"
                              >
                                Lacak
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection />
      </main>

      <ScrollToTop />
      <Footer />
      <ChatDrawer />
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(loggedUser) => {
          setUser(loggedUser);
          fetchUserReports();
        }}
      />
    </div>
  );
}
