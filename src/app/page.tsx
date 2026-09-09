"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase-client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReportForm from "@/components/ReportForm";
import TrackingView from "@/components/TrackingView";
import ChatDrawer from "@/components/ChatDrawer";
import AuthModal from "@/components/AuthModal";
import { Shield, Lock, EyeOff, CheckCircle2, ArrowRight } from "lucide-react";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
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
        <section className="border-b border-slate-800/80 bg-gradient-to-b from-[#0c1322] to-[#070b12] py-14 sm:py-20">
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
            </div>

            {/* Trust Badges */}
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-800/80 pt-8">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-800 bg-slate-900 text-cyan-400">
                  <Lock className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Enkripsi Server-Side</h4>
                  <p className="text-[11px] text-slate-400">PII dilindungi algoritma AES-256</p>
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

        {/* Content Section: Form & Tracking */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 space-y-12">
            <ReportForm user={user} />
            <TrackingView />
          </div>
        </section>
      </main>

      <Footer />
      <ChatDrawer />
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(loggedUser) => setUser(loggedUser)}
      />
    </div>
  );
}
