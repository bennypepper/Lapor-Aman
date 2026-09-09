import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateTicketId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let random = "";
  for (let i = 0; i < 6; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const date = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  return `LPR-${date}-${random}`;
}

export function isValidNIK(nik: string): boolean {
  return /^[0-9]{16}$/.test(nik.trim());
}

export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s-]/g, "");
  return /^(\+62|62|0)8[1-9][0-9]{7,11}$/.test(cleaned);
}

export function formatDate(timestamp: number | string | Date): string {
  if (!timestamp) return "-";
  const date = typeof timestamp === "number" ? new Date(timestamp) : new Date(timestamp);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function sanitizeText(text: string): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
