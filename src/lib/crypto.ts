import crypto from "node:crypto";
import CryptoJS from "crypto-js";
import { serverConfig } from "./server-config";

const V2_PREFIX = "v2:";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

function deriveAesKey(rawKey: string): Buffer {
  return crypto.createHash("sha256").update(rawKey, "utf8").digest();
}

export function encryptServerData(text: string, customKey?: string): string {
  if (!text) return "";
  const rawKey = customKey || serverConfig.serverEncryptionKey;
  const key = deriveAesKey(rawKey);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${V2_PREFIX}${iv.toString("base64")}:${authTag.toString("base64")}:${encrypted.toString("base64")}`;
}

export function decryptServerData(cipherText: string, customKey?: string): string {
  if (!cipherText) return "";
  const rawKey = customKey || serverConfig.serverEncryptionKey;

  if (cipherText.startsWith(V2_PREFIX)) {
    try {
      const parts = cipherText.split(":");
      if (parts.length !== 4) return "";
      const iv = Buffer.from(parts[1], "base64");
      const authTag = Buffer.from(parts[2], "base64");
      const encrypted = Buffer.from(parts[3], "base64");
      if (iv.length !== IV_LENGTH || authTag.length !== AUTH_TAG_LENGTH) {
        return "";
      }

      const key = deriveAesKey(rawKey);
      const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
      decipher.setAuthTag(authTag);
      const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
      return decrypted.toString("utf8");
    } catch {
      return "";
    }
  }

  // Backward-compatible legacy CryptoJS AES-CBC decryption
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, rawKey);
    return bytes.toString(CryptoJS.enc.Utf8) || "";
  } catch {
    return "";
  }
}

export function verifyEncryptionKey(candidate: string): boolean {
  if (!candidate || typeof candidate !== "string") return false;
  const expectedDigest = deriveAesKey(serverConfig.serverEncryptionKey);
  const candidateDigest = deriveAesKey(candidate);
  return crypto.timingSafeEqual(expectedDigest, candidateDigest);
}
