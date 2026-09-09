"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 250) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Kembali ke atas"
      className="fixed bottom-20 right-5 z-40 flex h-10 w-10 items-center justify-center rounded-md border border-slate-700 bg-slate-900/90 text-slate-200 shadow-xl backdrop-blur transition-all duration-200 hover:border-cyan-500 hover:bg-slate-800 hover:text-white hover:scale-105 active:scale-95 animate-in fade-in slide-in-from-bottom-2"
    >
      <ArrowUp className="h-4 w-4" />
    </button>
  );
}
