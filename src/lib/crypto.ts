import CryptoJS from "crypto-js";
import { serverConfig } from "./config";

export function encryptServerData(text: string, customKey?: string): string {
  if (!text) return "";
  const key = customKey || serverConfig.serverEncryptionKey;
  return CryptoJS.AES.encrypt(text, key).toString();
}

export function decryptServerData(cipherText: string, customKey?: string): string {
  if (!cipherText) return "";
  try {
    const key = customKey || serverConfig.serverEncryptionKey;
    const bytes = CryptoJS.AES.decrypt(cipherText, key);
    return bytes.toString(CryptoJS.enc.Utf8) || "";
  } catch {
    return "";
  }
}
