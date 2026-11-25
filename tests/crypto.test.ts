import { describe, it, expect } from "vitest";
import CryptoJS from "crypto-js";
import {
  encryptServerData,
  decryptServerData,
  verifyEncryptionKey,
} from "@/lib/crypto";
import { serverConfig } from "@/lib/server-config";

describe("crypto (AES-256-GCM + legacy fallback)", () => {
  it("encrypts with v2 AES-256-GCM format and round-trips", () => {
    const plaintext = "3174012345678901";
    const cipher = encryptServerData(plaintext);

    expect(cipher.startsWith("v2:")).toBe(true);
    const parts = cipher.split(":");
    expect(parts).toHaveLength(4);
    expect(decryptServerData(cipher)).toBe(plaintext);
  });

  it("produces unique ciphertexts for identical plaintext due to random IV", () => {
    const plaintext = "081234567890";
    const c1 = encryptServerData(plaintext);
    const c2 = encryptServerData(plaintext);

    expect(c1).not.toBe(c2);
    expect(decryptServerData(c1)).toBe(plaintext);
    expect(decryptServerData(c2)).toBe(plaintext);
  });

  it("detects tampering on v2 ciphertext and returns empty string", () => {
    const cipher = encryptServerData("Jl. Sudirman No. 1 Jakarta");
    const parts = cipher.split(":");
    const tamperedCt = Buffer.from(parts[3], "base64");
    tamperedCt[0] ^= 0xff;
    const tampered = `${parts[0]}:${parts[1]}:${parts[2]}:${tamperedCt.toString("base64")}`;

    expect(decryptServerData(tampered)).toBe("");
  });

  it("returns empty string when decrypting v2 ciphertext with wrong key", () => {
    const cipher = encryptServerData("secret-pii", "custom-key-for-test-minimum-32-chars!!");
    expect(decryptServerData(cipher, "different-wrong-key-minimum-32-chars!!")).toBe("");
  });

  it("maintains backward compatibility with legacy CryptoJS ciphertexts", () => {
    const plaintext = "Legacy NIK 3201010101010001";
    const legacyCipher = CryptoJS.AES.encrypt(
      plaintext,
      serverConfig.serverEncryptionKey
    ).toString();

    expect(legacyCipher.startsWith("v2:")).toBe(false);
    expect(decryptServerData(legacyCipher)).toBe(plaintext);
  });

  it("handles empty string gracefully", () => {
    expect(encryptServerData("")).toBe("");
    expect(decryptServerData("")).toBe("");
  });

  it("verifies encryption key using constant-time comparison", () => {
    expect(verifyEncryptionKey(serverConfig.serverEncryptionKey)).toBe(true);
    expect(verifyEncryptionKey("wrong-key")).toBe(false);
    expect(verifyEncryptionKey("")).toBe(false);
  });
});
