"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ArrowLeft,
  Lock,
  Unlock,
  Loader2,
  AlertCircle,
  FileSpreadsheet,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

interface ReportItem {
  id: string;
  ticketId: string;
  websiteUrl: string;
  category: string;
  details: string;
  isAnonymous: boolean;
  reporterName: string;
  reporterEmail: string;
  status: string;
  createdAt: string;
  decryptedPhone?: string;
  decryptedNik?: string;
  decryptedAddress?: string;
}

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [decryptKey, setDecryptKey] = useState("");
  const [isDecrypted, setIsDecrypted] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  const fetchReports = useCallback(async (adminEmail: string, key?: string) => {
    setLoadingReports(true);
    try {
      const headers: Record<string, string> = {
        "x-admin-email": adminEmail,
      };
      if (key) headers["x-decrypt-key"] = key;

      const res = await fetch("/api/admin/reports", { headers });
      const data = await res.json();
      if (res.ok) {
        setReports(data.reports || []);
        if (key) {
          setIsDecrypted(true);
          toast.success("Data identitas pelapor berhasil didekripsi.");
        }
      } else {
        toast.error(data.error || "Gagal memuat laporan.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan jaringan.");
    } finally {
      setLoadingReports(false);
    }
  }, []);

  const checkAdminSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.user?.role === "ADMIN") {
          setUser(data.user);
          fetchReports(data.user.email);
        } else if (data.user) {
          setUser(data.user); // Logged in but not admin
        }
      }
    } catch {
      // Not logged in
    }
  }, [fetchReports]);

  useEffect(() => {
    checkAdminSession();
  }, [checkAdminSession]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal masuk.");
      }

      if (data.user.role !== "ADMIN") {
        setUser(data.user);
        throw new Error("Akun Anda tidak memiliki hak akses administrator.");
      }

      setUser(data.user);
      toast.success(`Masuk sebagai ${data.user.email}`);
      fetchReports(data.user.email);
    } catch (err: any) {
      setLoginError(err.message || "Periksa email dan kata sandi.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setReports([]);
    setIsDecrypted(false);
    toast.success("Berhasil keluar dari sesi admin.");
  };

  const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/admin/reports/${ticketId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-email": user.email || "",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setReports((prev) =>
          prev.map((r) => (r.ticketId === ticketId ? { ...r, status: newStatus } : r))
        );
        toast.success(`Status ${ticketId} diubah ke ${newStatus}`);
      } else {
        const d = await res.json();
        toast.error(d.error || "Gagal memperbarui status.");
      }
    } catch (err) {
      console.error("Gagal update status:", err);
      toast.error("Gagal memperbarui status.");
    }
  };

  const handleExportCsv = () => {
    if (!reports.length) {
      toast.error("Tidak ada data laporan untuk diekspor.");
      return;
    }
    const headers = [
      "Nomor Tiket",
      "Tanggal",
      "Situs",
      "Kategori",
      "Pelapor",
      "NIK",
      "Telepon",
      "Alamat",
      "Status",
      "Detail Kronologi",
    ];
    const rows = reports.map((r) => [
      r.ticketId,
      r.createdAt,
      `"${r.websiteUrl}"`,
      `"${r.category}"`,
      r.isAnonymous ? "Anonim" : `"${r.reporterName} (${r.reporterEmail})"`,
      r.decryptedNik ? `"${r.decryptedNik}"` : '""',
      r.decryptedPhone ? `"${r.decryptedPhone}"` : '""',
      r.decryptedAddress ? `"${r.decryptedAddress.replace(/"/g, '""')}"` : '""',
      r.status,
      `"${(r.details || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `lapor_aman_audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("File CSV berhasil diunduh.");
  };

  const filteredReports =
    selectedStatus === "ALL" ? reports : reports.filter((r) => r.status === selectedStatus);

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070b12] p-4">
        <div className="w-full max-w-sm rounded-lg border border-slate-800 bg-[#0c121e] p-6 shadow-2xl">
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert className="h-5 w-5 text-cyan-400" />
            <h1 className="text-base font-semibold text-white">Admin Portal Lapor-Aman</h1>
          </div>

          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            Halaman khusus staf verifikasi dan penegakan hukum siber. Masuk menggunakan akun administrator resmi.
          </p>

          {user && user.role !== "ADMIN" && (
            <div className="mb-4 rounded-md border border-amber-900/60 bg-amber-950/30 p-3 text-xs text-amber-300">
              <p>
                Anda masuk sebagai <strong>{user.email}</strong>, namun akun ini bukan administrator.
              </p>
              <button
                onClick={handleLogout}
                className="mt-2 text-xs font-semibold text-amber-400 hover:underline"
              >
                Keluar dan ganti akun
              </button>
            </div>
          )}

          {loginError && (
            <div className="mb-4 flex items-center gap-2 rounded-md border border-rose-900/60 bg-rose-950/30 p-2.5 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Email Staf Admin</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@lapor.aman"
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Kata Sandi</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full mt-2 flex items-center justify-center gap-2 rounded-md bg-cyan-600 py-2.5 text-xs font-medium text-white transition hover:bg-cyan-500 disabled:opacity-50"
            >
              {loginLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Masuk ke Portal"}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-800 pt-4 text-center">
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition">
              <ArrowLeft className="h-3.5 w-3.5" />
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col">
      {/* Top bar */}
      <header className="border-b border-slate-800/80 bg-[#0c121e] px-4 py-3.5 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-slate-400 hover:text-white transition">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-cyan-400" />
              <h1 className="text-sm font-semibold text-white">Admin Verifikasi Lapor-Aman</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 hidden sm:inline">{user.email}</span>
            <button
              onClick={handleLogout}
              className="rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-slate-300 hover:text-white transition"
            >
              Keluar
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="mx-auto flex-1 max-w-7xl w-full p-4 sm:p-6 space-y-6">
        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-800 bg-[#0c121e] p-4">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white focus:border-cyan-500"
            >
              <option value="ALL">Semua Status ({reports.length})</option>
              <option value="BARU">BARU</option>
              <option value="DIVERIFIKASI">DIVERIFIKASI</option>
              <option value="DITINDAKLANJUTI">DITINDAKLANJUTI</option>
              <option value="SELESAI">SELESAI</option>
              <option value="DITOLAK">DITOLAK</option>
            </select>
          </div>

          {/* Decryption & Export Tool */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <input
                type="password"
                value={decryptKey}
                onChange={(e) => setDecryptKey(e.target.value)}
                placeholder="Kunci Dekripsi AES..."
                className="w-44 rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white focus:border-cyan-500"
              />
              <button
                onClick={() => fetchReports(user.email || "", decryptKey)}
                className="flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition"
              >
                {isDecrypted ? <Unlock className="h-3.5 w-3.5 text-emerald-400" /> : <Lock className="h-3.5 w-3.5" />}
                Dekripsi PII
              </button>
            </div>

            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 rounded-md bg-cyan-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-cyan-500"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              Ekspor CSV
            </button>
          </div>
        </div>

        {/* Reports Table */}
        <div className="rounded-lg border border-slate-800 bg-[#0c121e] overflow-hidden">
          {loadingReports ? (
            <div className="flex items-center justify-center p-12 text-slate-400 gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
              <span className="text-xs">Memuat laporan dari basis data...</span>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              Tidak ada data laporan yang ditemukan.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 bg-slate-900/60 font-mono text-[11px] text-slate-400 uppercase">
                  <tr>
                    <th className="px-4 py-3">Tiket</th>
                    <th className="px-4 py-3">Waktu</th>
                    <th className="px-4 py-3">Situs Tersangka</th>
                    <th className="px-4 py-3">Pelapor & Kontak</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Ubah Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredReports.map((r) => (
                    <tr key={r.ticketId} className="hover:bg-slate-900/30 transition">
                      <td className="px-4 py-3 font-mono font-medium text-cyan-400">{r.ticketId}</td>
                      <td className="px-4 py-3 text-slate-400">{formatDate(r.createdAt)}</td>
                      <td className="px-4 py-3 font-mono text-slate-200 max-w-[200px] truncate" title={r.websiteUrl}>
                        {r.websiteUrl}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {r.isAnonymous ? (
                          <span className="text-slate-500 italic">Anonim</span>
                        ) : (
                          <div>
                            <div className="font-medium text-slate-200">{r.reporterName}</div>
                            {r.reporterEmail && <div className="text-[10px] text-slate-400">{r.reporterEmail}</div>}
                            {r.decryptedPhone && (
                              <div className="font-mono text-[10px] text-emerald-400">Tel: {r.decryptedPhone}</div>
                            )}
                            {r.decryptedNik && (
                              <div className="font-mono text-[10px] text-cyan-400">NIK: {r.decryptedNik}</div>
                            )}
                            {r.decryptedAddress && (
                              <div className="text-[10px] text-slate-400 truncate max-w-[180px]">
                                Alm: {r.decryptedAddress}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            r.status === "SELESAI"
                              ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800"
                              : r.status === "DITOLAK"
                              ? "bg-rose-950/80 text-rose-300 border border-rose-800"
                              : r.status === "DITINDAKLANJUTI"
                              ? "bg-purple-950/80 text-purple-300 border border-purple-800"
                              : "bg-cyan-950/80 text-cyan-300 border border-cyan-800"
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <select
                          value={r.status}
                          onChange={(e) => handleUpdateStatus(r.ticketId, e.target.value)}
                          className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] text-slate-200 focus:border-cyan-500"
                        >
                          <option value="BARU">BARU</option>
                          <option value="DIVERIFIKASI">DIVERIFIKASI</option>
                          <option value="DITINDAKLANJUTI">DITINDAKLANJUTI</option>
                          <option value="SELESAI">SELESAI</option>
                          <option value="DITOLAK">DITOLAK</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
