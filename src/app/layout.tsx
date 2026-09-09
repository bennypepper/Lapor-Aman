import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import Script from "next/script";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Lapor-Aman | Platform Pengaduan Judi Online Resmi",
  description:
    "Platform pengaduan masyarakat untuk memberantas aktivitas situs judi online dengan proteksi enkripsi data pelapor dan transparansi status penindakan.",
  keywords: ["lapor judi online", "pengaduan masyarakat", "blokir situs", "komdigi", "polri", "cyber crime"],
  authors: [{ name: "Lapor-Aman Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth">
      <head>
        <link rel="icon" href="/assets/img/logo.png" />
      </head>
      <body className="min-h-screen flex flex-col bg-[#070b12] text-slate-100 antialiased selection:bg-cyan-500/20 selection:text-cyan-300">
        <Toaster position="top-right" theme="dark" richColors />
        {children}
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
