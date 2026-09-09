"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  time: string;
}

export default function ChatDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "bot",
      text: `Halo! Selamat datang di **Lapor-Aman**, platform pengaduan masyarakat resmi untuk bersama-sama memberantas situs dan konten perjudian online di Indonesia.

Ada yang bisa saya bantu hari ini? Anda dapat menanyakan tentang:
* Alur cara melaporkan situs judi online
* Keamanan dan privasi data pelapor (enkripsi AES-256)
* Edukasi seputar bahaya judi online

Silakan sampaikan pertanyaan atau laporan Anda.`,
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const time = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
      time,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: data.reply || "Maaf, tidak dapat memproses jawaban saat ini.",
        time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: "bot",
          text: "Terjadi gangguan jaringan saat menghubungi asisten AI.",
          time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-cyan-500/40 bg-cyan-600 text-white shadow-lg transition-all hover:scale-105 hover:bg-cyan-500 active:scale-95"
          aria-label="Buka Asisten LaporAman"
        >
          {isOpen ? <X className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
        </button>
      </div>

      {/* Chat Window Drawer */}
      {isOpen && (
        <div className="fixed bottom-20 right-5 z-50 flex h-[520px] w-[380px] max-w-[calc(100vw-32px)] flex-col rounded-lg border border-slate-800 bg-[#090e17] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 bg-[#0c131f] px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-md border border-cyan-500/30 bg-cyan-950/60 text-cyan-400">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-white">CS Virtual LaporAman</h3>
                <p className="text-[10px] text-slate-400">Didukung Gemini AI</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Quick Suggestion Chips */}
          <div className="flex gap-1.5 overflow-x-auto border-b border-slate-800/80 bg-slate-900/30 p-2 scrollbar-none">
            {["Cara melapor?", "Keamanan data?", "Lacak tiket?"].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                className="whitespace-nowrap rounded border border-slate-700/60 bg-slate-800/40 px-2.5 py-1 text-[11px] text-slate-300 hover:border-cyan-500/50 hover:text-white transition"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 text-xs ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.sender === "bot" && (
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-cyan-400 mt-0.5">
                    <Bot className="h-3 w-3" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-md p-3 leading-relaxed ${
                    m.sender === "user"
                      ? "bg-cyan-600 text-white"
                      : "border border-slate-800 bg-[#0f172a] text-slate-200"
                  }`}
                >
                  {m.sender === "user" ? (
                    <p className="whitespace-pre-wrap">{m.text}</p>
                  ) : (
                    <div className="space-y-2 text-xs leading-relaxed">
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className="mb-1.5 last:mb-0 leading-relaxed">{children}</p>,
                          strong: ({ children }) => (
                            <strong className="font-semibold text-cyan-300">{children}</strong>
                          ),
                          em: ({ children }) => <em className="italic text-slate-300">{children}</em>,
                          ul: ({ children }) => (
                            <ul className="my-1.5 ml-4 list-disc space-y-1 text-slate-300">{children}</ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="my-1.5 ml-4 list-decimal space-y-1 text-slate-300">{children}</ol>
                          ),
                          li: ({ children }) => <li className="leading-relaxed pl-0.5">{children}</li>,
                          a: ({ href, children }) => (
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-cyan-400 underline hover:text-cyan-300"
                            >
                              {children}
                            </a>
                          ),
                          code: ({ children }) => (
                            <code className="rounded bg-slate-800 px-1 py-0.5 font-mono text-[11px] text-cyan-300">
                              {children}
                            </code>
                          ),
                        }}
                      >
                        {m.text}
                      </ReactMarkdown>
                    </div>
                  )}
                  <span className="block mt-1 text-[9px] text-slate-400 text-right">{m.time}</span>
                </div>
                {m.sender === "user" && (
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-slate-300 mt-0.5">
                    <User className="h-3 w-3" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-slate-400 pl-8">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-400" />
                <span className="text-[11px]">Asisten sedang merespons...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 border-t border-slate-800 bg-[#0c131f] p-2.5"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tulis pertanyaan Anda..."
              className="flex-1 rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex h-8 w-8 items-center justify-center rounded-md bg-cyan-600 text-white transition hover:bg-cyan-500 disabled:opacity-40"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
