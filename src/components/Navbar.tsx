"use client";

import Link from "next/link";
import { Shield, ShieldAlert, User, LogOut, Search, FileText } from "lucide-react";

interface NavbarProps {
  user: any;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export default function Navbar({ user, onOpenAuth, onLogout }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#070b12]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md border border-cyan-500/30 bg-cyan-950/40 text-cyan-400 shadow-sm">
            <Shield className="h-5 w-5 stroke-[1.75]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold tracking-tight text-white">Lapor-Aman</span>
              <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono font-medium text-cyan-400">
                v2.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Portal Pengaduan Aktivitas Judi Online</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="#lapor"
            className="flex items-center gap-1.5 text-xs font-medium text-slate-300 transition-colors hover:text-cyan-400"
          >
            <FileText className="h-3.5 w-3.5 text-slate-400" />
            Kirim Laporan
          </Link>
          <Link
            href="#tracking"
            className="flex items-center gap-1.5 text-xs font-medium text-slate-300 transition-colors hover:text-cyan-400"
          >
            <Search className="h-3.5 w-3.5 text-slate-400" />
            Lacak Tiket
          </Link>
          <Link
            href="/admin"
            className="flex items-center gap-1.5 text-xs font-medium text-slate-400 transition-colors hover:text-white"
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            Admin Portal
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <span className="hidden text-xs text-slate-400 sm:inline truncate max-w-[150px]">
                {user.email}
              </span>
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-slate-600 hover:text-white transition"
              >
                <LogOut className="h-3.5 w-3.5" />
                Keluar
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 rounded-md border border-cyan-500/40 bg-cyan-950/50 px-3.5 py-1.5 text-xs font-medium text-cyan-300 shadow-sm transition hover:bg-cyan-900/60 hover:text-white"
            >
              <User className="h-3.5 w-3.5 stroke-[2]" />
              Masuk / Daftar
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
