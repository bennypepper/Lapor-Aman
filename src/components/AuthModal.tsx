"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, Lock, Mail, User, Phone, MapPin, AlertCircle, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { isValidNIK, isValidPhone } from "@/lib/utils";
import { clientConfig } from "@/lib/client-config";

interface AuthUser {
  id?: string;
  email: string;
  name?: string | null;
  role?: string;
}

interface TurnstileApi {
  render: (container: HTMLElement, options: Record<string, unknown>) => string;
  remove: (id: string) => void;
}

type TurnstileWindow = Window & { turnstile?: TurnstileApi };

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: AuthUser) => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullname, setFullname] = useState("");
  const [nik, setNik] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileError, setTurnstileError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  const handleClose = useCallback(() => {
    setError(null);
    setTurnstileError(null);
    setTurnstileToken(null);
    if (widgetIdRef.current && typeof window !== "undefined") {
      const turnstile = (window as TurnstileWindow).turnstile;
      if (turnstile) {
        try {
          turnstile.remove(widgetIdRef.current);
        } catch {}
      }
      widgetIdRef.current = null;
    }
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, handleClose]);

  // Activate Turnstile when user has filled email & password in register mode
  const turnstileActivated = isRegister && email.trim().length >= 4 && password.length >= 8;

  // Mount Turnstile widget smoothly once activated
  useEffect(() => {
    if (!isOpen || !isRegister || !turnstileActivated) return;

    let timer: ReturnType<typeof setInterval> | null = null;
    let isMounted = true;
    let attempts = 0;
    const MAX_ATTEMPTS = 50;

    const renderTurnstile = () => {
      if (!isMounted) return;
      const turnstile = (window as TurnstileWindow).turnstile;
      const container = turnstileContainerRef.current;

      if (turnstile && container) {
        if (widgetIdRef.current || container.children.length > 0) return;

        try {
          const sitekey = clientConfig.turnstileSiteKey.trim();
          const id = turnstile.render(container, {
            sitekey,
            theme: "dark",
            callback: (token: string) => {
              if (isMounted) {
                setTurnstileToken(token);
                setTurnstileError(null);
              }
            },
            "error-callback": (err: unknown) => {
              console.warn("AuthModal Cloudflare Turnstile error:", err);
              if (isMounted) {
                setTurnstileToken(null);
                setTurnstileError("Verifikasi keamanan Turnstile gagal dimuat.");
              }
            },
            "expired-callback": () => {
              if (isMounted) setTurnstileToken(null);
            },
          });
          widgetIdRef.current = id;
        } catch (err) {
          console.error("AuthModal Turnstile render error:", err);
          if (isMounted) {
            setTurnstileError("Gagal merender widget verifikasi keamanan.");
          }
        }
      }
    };

    if (typeof window !== "undefined" && (window as TurnstileWindow).turnstile) {
      renderTurnstile();
    } else {
      timer = setInterval(() => {
        attempts += 1;
        if (typeof window !== "undefined" && (window as TurnstileWindow).turnstile) {
          renderTurnstile();
          if (timer) clearInterval(timer);
        } else if (attempts >= MAX_ATTEMPTS) {
          if (timer) clearInterval(timer);
          if (isMounted) {
            setTurnstileError(
              "Widget verifikasi Cloudflare Turnstile gagal dimuat. Muat ulang halaman dan coba lagi."
            );
          }
        }
      }, 150);
    }

    return () => {
      isMounted = false;
      if (timer) clearInterval(timer);
      if (widgetIdRef.current && typeof window !== "undefined") {
        const turnstile = (window as TurnstileWindow).turnstile;
        if (turnstile) {
          try {
            turnstile.remove(widgetIdRef.current);
          } catch {}
        }
        widgetIdRef.current = null;
      }
    };
  }, [isOpen, isRegister, turnstileActivated]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        if (password.length < 8 || password.length > 72) {
          throw new Error("Kata sandi harus terdiri dari 8 hingga 72 karakter.");
        }
        if (!fullname.trim() || !nik.trim() || !phone.trim() || !address.trim()) {
          throw new Error("Semua data profil wajib dilengkapi.");
        }
        if (!isValidNIK(nik)) {
          throw new Error("NIK harus tepat 16 digit angka.");
        }
        if (!isValidPhone(phone)) {
          throw new Error("Nomor ponsel tidak valid.");
        }
        if (!turnstileToken) {
          throw new Error("Silakan selesaikan verifikasi keamanan CAPTCHA pendaftaran.");
        }

        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            fullname,
            nik,
            phone,
            address,
            turnstileToken,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Pendaftaran gagal.");
        }

        toast.success("Akun pelapor berhasil dibuat!");
        onSuccess(data.user);
        handleClose();
      } else {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Gagal masuk.");
        }

        toast.success(`Selamat datang kembali, ${data.user.name || data.user.email}!`);
        onSuccess(data.user);
        handleClose();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal melakukan otentikasi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="relative w-full max-w-md rounded-lg border border-slate-800 bg-[#0c121e] p-6 shadow-2xl"
      >
        <button
          type="button"
          onClick={handleClose}
          aria-label="Tutup dialog"
          className="absolute right-4 top-4 text-slate-400 hover:text-white transition"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 id="auth-modal-title" className="text-base font-semibold text-white">
          {isRegister ? "Pendaftaran Akun Pelapor" : "Masuk ke Akun Anda"}
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          {isRegister
            ? "Lengkapi profil untuk pelaporan terverifikasi dan perlindungan PII server-side."
            : "Masuk untuk memantau seluruh riwayat aduan Anda."}
        </p>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-md border border-rose-900/60 bg-rose-950/30 p-2.5 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@domain.com"
                className="w-full rounded-md border border-slate-700 bg-slate-900/80 pl-9 pr-3 py-2 text-xs text-white focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">Kata Sandi</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <input
                type="password"
                required
                minLength={isRegister ? 8 : undefined}
                maxLength={72}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isRegister ? "Minimal 8 karakter" : "••••••••"}
                className="w-full rounded-md border border-slate-700 bg-slate-900/80 pl-9 pr-3 py-2 text-xs text-white focus:border-cyan-500"
              />
            </div>
          </div>

          {isRegister && (
            <>
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Nama Lengkap Sesuai KTP</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    placeholder="Nama Lengkap"
                    className="w-full rounded-md border border-slate-700 bg-slate-900/80 pl-9 pr-3 py-2 text-xs text-white focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">NIK (16 Digit)</label>
                  <input
                    type="text"
                    required
                    maxLength={16}
                    value={nik}
                    onChange={(e) => setNik(e.target.value)}
                    placeholder="3507..."
                    className="w-full rounded-md border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs font-mono text-white focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Nomor Ponsel / WA</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="08123456789"
                      className="w-full rounded-md border border-slate-700 bg-slate-900/80 pl-9 pr-3 py-2 text-xs text-white focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Alamat Domisili</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Kota / Kabupaten domisili"
                    className="w-full rounded-md border border-slate-700 bg-slate-900/80 pl-9 pr-3 py-2 text-xs text-white focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Turnstile Bot Protection with Smooth Skeleton Placeholder */}
              <div className="pt-2 pb-1">
                {!turnstileActivated ? (
                  <div className="rounded-md border border-slate-800/80 bg-slate-900/40 px-3 py-2 min-h-[58px] flex items-center justify-between gap-3 text-slate-400 transition-all duration-300">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                        <ShieldCheck className="h-3.5 w-3.5 text-cyan-500/70" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-medium text-slate-300">Proteksi Registrasi</span>
                          <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">CAPTCHA</span>
                        </div>
                        <p className="text-[10px] text-slate-500">
                          Lengkapi email & kata sandi untuk verifikasi keamanan.
                        </p>
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                      <span className="text-[10px] text-slate-500 font-mono">Standby</span>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-md border border-slate-800 bg-slate-900/40 p-2 min-h-[65px] flex flex-col items-center justify-center transition-all duration-300">
                    <div
                      ref={turnstileContainerRef}
                      className="min-h-[65px] w-full flex items-center justify-center"
                    />
                    {turnstileError ? (
                      <p className="text-[11px] text-rose-300 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-400" />
                        <span>{turnstileError}</span>
                      </p>
                    ) : (
                      !turnstileToken && (
                        <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
                          Memproses tantangan keamanan Cloudflare...
                        </p>
                      )
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 rounded-md bg-cyan-600 py-2.5 text-xs font-medium text-white transition hover:bg-cyan-500 disabled:opacity-50"
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {isRegister ? "Daftar Akun Baru" : "Masuk"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
              setTurnstileError(null);
              setTurnstileToken(null);
              if (widgetIdRef.current && typeof window !== "undefined") {
                const turnstile = (window as TurnstileWindow).turnstile;
                if (turnstile) {
                  try {
                    turnstile.remove(widgetIdRef.current);
                  } catch {}
                }
                widgetIdRef.current = null;
              }
            }}
            className="text-xs text-cyan-400 hover:underline"
          >
            {isRegister ? "Sudah memiliki akun? Masuk di sini" : "Belum punya akun? Daftar sekarang"}
          </button>
        </div>
      </div>
    </div>
  );
}
