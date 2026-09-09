"use client";

import { useState } from "react";
import { X, Lock, Mail, User, Phone, MapPin, AlertCircle, Loader2 } from "lucide-react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "@/lib/firebase-client";
import { isValidNIK, isValidPhone } from "@/lib/utils";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullname, setFullname] = useState("");
  const [nik, setNik] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        if (!fullname.trim() || !nik.trim() || !phone.trim() || !address.trim()) {
          throw new Error("Semua data profil wajib dilengkapi.");
        }
        if (!isValidNIK(nik)) {
          throw new Error("NIK harus terdiri dari 16 digit angka.");
        }
        if (!isValidPhone(phone)) {
          throw new Error("Nomor ponsel tidak valid.");
        }

        const cred = await createUserWithEmailAndPassword(auth, email, password);
        onSuccess(cred.user);
        onClose();
      } else {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        onSuccess(cred.user);
        onClose();
      }
    } catch (err: any) {
      let msg = err.message || "Gagal melakukan otentikasi.";
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
        msg = "Email atau kata sandi tidak cocok.";
      } else if (err.code === "auth/email-already-in-use") {
        msg = "Email sudah terdaftar. Silakan masuk.";
      } else if (err.code === "auth/weak-password") {
        msg = "Kata sandi minimal 6 karakter.";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-lg border border-slate-800 bg-[#0c121e] p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white transition"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 className="text-base font-semibold text-white">
          {isRegister ? "Pendaftaran Akun Pelapor" : "Masuk ke Akun Anda"}
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          {isRegister
            ? "Lengkapi profil untuk pelaporan terverifikasi."
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
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
