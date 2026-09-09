import { Shield, ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-[#060a10] py-10 text-xs text-slate-400 mt-auto">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-4 w-4 text-cyan-400" />
              <span className="font-semibold text-white text-sm">Lapor-Aman</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Inisiatif platform partisipatif masyarakat dalam percepatan pemberantasan dan pemblokiran konten perjudian online di ruang digital Indonesia.
            </p>
          </div>

          <div>
            <h4 className="font-mono text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-3">
              Kanal Resmi Terkait
            </h4>
            <ul className="space-y-2 text-[11px]">
              <li>
                <a
                  href="https://aduankonten.id"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 hover:text-cyan-400 transition"
                >
                  <ExternalLink className="h-3 w-3" />
                  Aduan Konten Komdigi RI
                </a>
              </li>
              <li>
                <a
                  href="https://patrolisiber.id"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 hover:text-cyan-400 transition"
                >
                  <ExternalLink className="h-3 w-3" />
                  Patroli Siber Bareskrim Polri
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-3">
              Kerahasiaan & Hukum
            </h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Seluruh data identitas pelapor diproteksi enkripsi AES-256 server-side. Laporan palsu atau fitnah dapat dikenakan sanksi sesuai UU ITE Pasal 27 & 45.
            </p>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>© 2026 Lapor-Aman. Inisiatif rekayasa perangkat lunak untuk ruang digital yang sehat.</p>
          <p className="font-mono">Dikelola oleh Benny Pepper</p>
        </div>
      </div>
    </footer>
  );
}
