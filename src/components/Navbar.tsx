"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  History,
} from "lucide-react";

import Image from "next/image";

interface NavbarUser {
  email: string;
  name?: string | null;
  role?: string;
}

interface NavbarProps {
  user: NavbarUser | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export default function Navbar({ user, onOpenAuth, onLogout }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#070b12]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <Image
            src="/assets/img/logo.png"
            alt="Meridian Digital Logo"
            width={40}
            height={40}
            className="h-10 w-auto object-contain transition group-hover:scale-105"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-white">
                Lapor<span className="text-cyan-400">Aman</span>
              </span>
              <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-mono font-medium text-cyan-400">
                v2.0
              </span>
            </div>
            <p className="text-[10px] text-slate-400">PT. Meridian Digital • Mitra Pemerintah</p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="#hero"
            className="flex items-center gap-1 text-xs font-medium text-slate-300 transition-colors hover:text-cyan-400"
          >
            Beranda
          </Link>
          <Link
            href="#tracking"
            className="flex items-center gap-1 text-xs font-medium text-slate-300 transition-colors hover:text-cyan-400"
          >
            Lacak Tiket
          </Link>
          <Link
            href="#faq"
            className="flex items-center gap-1 text-xs font-medium text-slate-300 transition-colors hover:text-cyan-400"
          >
            FAQ
          </Link>

          {user && (
            <Link
              href="#riwayat"
              className="flex items-center gap-1 text-xs font-medium text-slate-300 transition-colors hover:text-cyan-400"
            >
              Riwayat Saya
            </Link>
          )}

          {(user?.role === "ADMIN" || !user) && (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 text-xs font-medium text-amber-400/90 transition-colors hover:text-amber-300"
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              Dashboard Admin
            </Link>
          )}
        </nav>

        {/* Desktop Auth Controls */}
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/90 py-1 pl-2.5 pr-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-950 text-[11px] font-bold text-cyan-400">
                  {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-medium text-slate-200 max-w-[120px] truncate">
                    {user.name || user.email}
                  </p>
                  <p className="text-[9px] font-mono text-cyan-400 uppercase tracking-wider leading-none">
                    {user.role || "WARGA"}
                  </p>
                </div>
              </div>
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
              <UserIcon className="h-3.5 w-3.5 stroke-[2]" />
              Masuk / Daftar
            </button>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-md border border-slate-700 bg-slate-900 p-2 text-slate-300 hover:text-white"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-800 bg-[#0c121e] px-4 py-4 md:hidden space-y-3">
          {user && (
            <div className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/80 p-3 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-950 text-xs font-bold text-cyan-400">
                {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-semibold text-white">{user.name || user.email}</p>
                <p className="text-[10px] text-cyan-400 font-mono uppercase">{user.role || "WARGA"}</p>
              </div>
            </div>
          )}

          <Link
            href="#hero"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800/80 hover:text-white"
          >
            Beranda
          </Link>
          <Link
            href="#tracking"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800/80 hover:text-white"
          >
            Lacak Tiket
          </Link>
          <Link
            href="#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800/80 hover:text-white"
          >
            FAQ
          </Link>

          {user && (
            <Link
              href="#riwayat"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800/80 hover:text-white"
            >
              <History className="h-4 w-4 text-cyan-400" />
              Riwayat Laporan Saya
            </Link>
          )}

          <Link
            href="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800/80 hover:text-white"
          >
            <ShieldAlert className="h-4 w-4 text-amber-400" />
            Admin Portal
          </Link>

          <div className="border-t border-slate-800 pt-3">
            {user ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogout();
                }}
                className="flex w-full items-center justify-center gap-2 rounded-md border border-slate-700 bg-slate-900 py-2 text-xs font-medium text-slate-300 hover:text-white"
              >
                <LogOut className="h-4 w-4" />
                Keluar
              </button>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth();
                }}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-cyan-600 py-2 text-xs font-medium text-white hover:bg-cyan-500"
              >
                <UserIcon className="h-4 w-4" />
                Masuk / Daftar
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
