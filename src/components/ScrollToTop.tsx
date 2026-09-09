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
      className="fixed bottom-5 right-20 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-slate-700/80 bg-slate-900/90 text-slate-200 shadow-xl backdrop-blur transition-all duration-200 hover:border-cyan-500 hover:bg-slate-800 hover:text-cyan-400 hover:scale-105 active:scale-95 animate-in fade-in slide-in-from-bottom-2"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
