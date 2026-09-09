"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  X,
  ShieldCheck,
  FileText,
} from "lucide-react";

export default function Footer() {
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);

  return (
    <>
      <footer className="bg-[#02040a] border-t border-slate-800 pt-16 pb-8 mt-auto text-xs text-slate-400">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            {/* Kolom 1: Perusahaan */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-5">
                <Image
                  src="/assets/img/logo.png"
                  alt="Meridian Digital Logo"
                  width={48}
                  height={48}
                  className="h-12 w-auto object-contain"
                />
                <span className="text-lg font-bold text-white tracking-tight uppercase">
                  Meridian Digital
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-6 max-w-sm">
                Mitra resmi pemerintah dalam menjaga ruang digital Indonesia. Kami menyediakan platform
                pelaporan yang aman, rahasia, dan transparan.
              </p>
              <div className="flex gap-3">
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn Meridian Digital"
                  className="w-8 h-8 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-all"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.32a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28z" />
                  </svg>
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter Meridian Digital"
                  className="w-8 h-8 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-all"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram Meridian Digital"
                  className="w-8 h-8 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-all"
                >
                  <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Kolom 2: Tautan Cepat */}
            <div>
              <h4 className="text-[11px] font-mono font-bold text-slate-300 mb-5 uppercase tracking-widest">
                Tautan Cepat
              </h4>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <a
                    href="#hero"
                    className="text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1.5"
                  >
                    <ChevronRight className="w-3 h-3 text-slate-600" /> Beranda
                  </a>
                </li>
                <li>
                  <a
                    href="#tracking"
                    className="text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1.5"
                  >
                    <ChevronRight className="w-3 h-3 text-slate-600" /> Lacak Laporan
                  </a>
                </li>
                <li>
                  <a
                    href="#faq"
                    className="text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1.5"
                  >
                    <ChevronRight className="w-3 h-3 text-slate-600" /> FAQ
                  </a>
                </li>
                <li>
                  <Link
                    href="/admin"
                    className="text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1.5"
                  >
                    <ChevronRight className="w-3 h-3 text-slate-600" /> Dashboard Admin
                  </Link>
                </li>
              </ul>
            </div>

            {/* Kolom 3: Hubungi Kami */}
            <div>
              <h4 className="text-[11px] font-mono font-bold text-slate-300 mb-5 uppercase tracking-widest">
                Hubungi Kami
              </h4>
              <ul className="space-y-3.5 text-xs">
                <li className="flex items-start gap-2.5 text-slate-400">
                  <MapPin className="w-4 h-4 mt-0.5 text-cyan-500 shrink-0" />
                  <span className="leading-relaxed">
                    Villa Puncak Tidar Blok N1<br />
                    Kab. Malang, Jawa Timur 65151
                  </span>
                </li>
                <li className="flex items-center gap-2.5 text-slate-400 font-mono">
                  <Phone className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                  <span>(0341) 550171</span>
                </li>
                <li className="flex items-center gap-2.5 text-slate-400">
                  <Mail className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                  <span>contact@laporaman.com</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-slate-500 text-[11px] font-mono text-center sm:text-left">
              &copy; 2025 PT. MERIDIAN DIGITAL. ALL RIGHTS RESERVED.
            </p>
            <div className="flex gap-5 text-[11px] font-mono text-slate-500 uppercase">
              <button
                type="button"
                onClick={() => setPrivacyModalOpen(true)}
                className="hover:text-cyan-400 transition-colors"
              >
                Kebijakan Privasi
              </button>
              <button
                type="button"
                onClick={() => setTermsModalOpen(true)}
                className="hover:text-cyan-400 transition-colors"
              >
                Syarat & Ketentuan
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Privacy Policy Modal */}
      {privacyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-lg border border-slate-800 bg-[#0c121e] shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/80">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-cyan-400" />
                Kebijakan Privasi PT. Meridian Digital
              </h2>
              <button
                onClick={() => setPrivacyModalOpen(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto text-xs text-slate-300 space-y-4 leading-relaxed custom-scrollbar">
              <div>
                <h3 className="text-white font-semibold mb-1">1. Pendahuluan</h3>
                <p className="text-slate-400">
                  PT. Meridian Digital ("Kami") berkomitmen untuk melindungi privasi dan keamanan data pribadi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, memproses, dan melindungi informasi yang Anda berikan saat menggunakan platform LaporAman.
                </p>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">2. Informasi yang Kami Kumpulkan</h3>
                <p className="text-slate-400 mb-1">
                  Dalam rangka memverifikasi validitas pelapor sesuai standar penegakan hukum pemerintah, kami mengumpulkan:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-400">
                  <li><strong>Identitas Pribadi:</strong> Nama Lengkap (sesuai KTP), NIK, Alamat Domisili, dan Nomor Telepon.</li>
                  <li><strong>Data Akun:</strong> Email dan Kata Sandi ter-hash (Bcrypt).</li>
                  <li><strong>Data Laporan:</strong> URL situs judi online, bukti tangkapan layar, kronologi, dan nomor rekening perantara.</li>
                </ul>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">3. Penggunaan Data dan Enkripsi Server-Side</h3>
                <ul className="list-disc pl-5 space-y-1 text-slate-400">
                  <li><strong>Keamanan Kriptografi:</strong> Seluruh data identitas sensitif (NIK, telepon, domisili) dienkripsi penuh menggunakan algoritma AES-256 sebelum disimpan ke dalam database.</li>
                  <li><strong>Tujuan Verifikasi:</strong> Data hanya digunakan untuk validasi laporan masyarakat dan diteruskan ke otoritas terkait (Komdigi & POLRI) jika diperlukan penyelidikan lanjutan.</li>
                </ul>
              </div>
              <div className="pt-4 border-t border-slate-800 text-[10px] font-mono text-slate-500">
                Pembaruan Terakhir: Desember 2025 • PT. Meridian Digital
              </div>
            </div>
            <div className="p-3 border-t border-slate-800 bg-slate-900/60 flex justify-end">
              <button
                onClick={() => setPrivacyModalOpen(false)}
                className="rounded-md bg-cyan-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-cyan-500 transition"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terms of Service Modal */}
      {termsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-lg border border-slate-800 bg-[#0c121e] shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/80">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="h-4 w-4 text-amber-400" />
                Syarat & Ketentuan Layanan
              </h2>
              <button
                onClick={() => setTermsModalOpen(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto text-xs text-slate-300 space-y-4 leading-relaxed custom-scrollbar">
              <p className="text-slate-300">
                Dengan mengakses dan menggunakan platform LaporAman yang dikembangkan oleh PT. Meridian Digital bermitra dengan instansi pemerintah, Anda menyatakan setuju dan terikat oleh ketentuan berikut:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-slate-400">
                <li><strong>Kebenaran Laporan:</strong> Anda menjamin bahwa informasi, tautan, dan bukti yang Anda laporkan adalah fakta objektif dan bukan rekayasa, fitnah, atau informasi palsu.</li>
                <li><strong>Konsekuensi Hukum:</strong> Penyalahgunaan platform untuk menyebarkan informasi palsu atau mencemarkan nama baik dapat ditindaklanjuti sesuai ketentuan peraturan perundang-undangan (UU ITE Pasal 27 & 45).</li>
                <li><strong>Kerahasiaan Pelapor:</strong> PT. Meridian Digital menjamin perlindungan identitas pelapor melalui mekanisme anonimitas dan enkripsi berlapis.</li>
              </ul>
              <div className="pt-4 border-t border-slate-800 text-[10px] font-mono text-slate-500">
                Pembaruan Terakhir: Desember 2025 • PT. Meridian Digital
              </div>
            </div>
            <div className="p-3 border-t border-slate-800 bg-slate-900/60 flex justify-end">
              <button
                onClick={() => setTermsModalOpen(false)}
                className="rounded-md bg-cyan-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-cyan-500 transition"
              >
                Saya Setuju
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
