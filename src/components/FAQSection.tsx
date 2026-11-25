"use client";

import { useState } from "react";
import { Plus, Minus, HelpCircle } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "Bagaimana keamanan data NIK dan KTP saya?",
    answer:
      "Data pribadi Anda seperti NIK, Nama, dan Alamat diubah menjadi kode rahasia (dienkripsi) sebelum disimpan ke dalam database menggunakan algoritma AES-256 server-side. Petugas verifikator pun tidak dapat melihat identitas Anda tanpa kunci otorisasi khusus.",
  },
  {
    question: "Apakah nama saya akan ketahuan oleh publik?",
    answer:
      'Tidak. Jika Anda mencentang pilihan "Rahasiakan nama saya (Anonim)" saat mengisi formulir, maka nama Anda tidak akan pernah ditampilkan pada laporan publik atau dilacak oleh pihak ketiga yang tidak berkepentingan.',
  },
  {
    question: "Berapa lama laporan saya akan diproses?",
    answer:
      'Setelah laporan masuk dan diverifikasi, umumnya pihak Komdigi akan memproses pemblokiran situs dalam waktu 1x24 jam kerja. Anda selalu bisa mengecek statusnya di fitur "Lacak Status Laporan".',
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="relative py-16 sm:py-20 border-t border-slate-800/80 bg-[#060a12]/60 overflow-hidden">
      {/* Background Cyber Grid */}
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(#00dfa2 1px, transparent 1px), linear-gradient(90deg, #00dfa2 1px, transparent 1px)",
          backgroundSize: "32px 32px"
        }}
      />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-950/30 px-3 py-1 text-xs font-medium text-cyan-400 mb-3">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Pusat Bantuan Publik</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Pertanyaan Umum (FAQ)
          </h2>
          <p className="mt-2 text-xs text-slate-400 max-w-lg mx-auto">
            Pelajari bagaimana perlindungan identitas pelapor dijamin aman dan alur pemblokiran situs judi beroperasi.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-lg border border-slate-800 bg-[#0c1322]/80 backdrop-blur-sm transition-colors hover:border-slate-700"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left text-xs sm:text-sm font-medium text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
                >
                  <span className="pr-4">{faq.question}</span>
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-slate-700 bg-slate-800/80 text-slate-400">
                    {isOpen ? <Minus className="h-3.5 w-3.5 text-cyan-400" /> : <Plus className="h-3.5 w-3.5" />}
                  </div>
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 text-xs leading-relaxed text-slate-400 border-t border-slate-800/60 mt-1">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
