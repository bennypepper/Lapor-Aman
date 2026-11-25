import { describe, it, expect, afterEach } from "vitest";
import {
  signSessionToken,
  verifySessionToken,
  resolveEffectiveRole,
} from "@/lib/auth";
import { serverConfig } from "@/lib/server-config";
import { clientConfig } from "@/lib/client-config";
import {
  generateTicketId,
  formatDate,
  escapeCsvCell,
} from "@/lib/utils";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("config & auth security", () => {
  it("exports clean clientConfig without server secrets", () => {
    expect(clientConfig.appName).toBe("Lapor-Aman");
    expect(clientConfig.appVersion).toBe("2.0.0");
    expect(typeof clientConfig.turnstileSiteKey).toBe("string");
    expect("serverEncryptionKey" in clientConfig).toBe(false);
  });

  it("defaults adminEmails to empty array when ADMIN_EMAILS is unset", () => {
    delete process.env.ADMIN_EMAILS;
    expect(serverConfig.adminEmails).toEqual([]);
  });

  it("never shares dev fallback between jwtSecret and serverEncryptionKey", () => {
    delete process.env.JWT_SECRET;
    delete process.env.SERVER_ENCRYPTION_KEY;
    expect(serverConfig.jwtSecret).not.toBe(serverConfig.serverEncryptionKey);
    expect(serverConfig.jwtSecret.length).toBeGreaterThanOrEqual(32);
    expect(serverConfig.serverEncryptionKey.length).toBeGreaterThanOrEqual(32);
  });

  it("fails closed in production when JWT_SECRET or SERVER_ENCRYPTION_KEY is missing or <32 chars", () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = "production";
    delete process.env.JWT_SECRET;
    expect(() => serverConfig.jwtSecret).toThrow();

    process.env.JWT_SECRET = "short-secret";
    expect(() => serverConfig.jwtSecret).toThrow();

    delete process.env.SERVER_ENCRYPTION_KEY;
    expect(() => serverConfig.serverEncryptionKey).toThrow();

    process.env.SERVER_ENCRYPTION_KEY = "short-key";
    expect(() => serverConfig.serverEncryptionKey).toThrow();
  });

  it("signs and verifies HS256 JWT tokens", async () => {
    const token = await signSessionToken({
      id: "usr_1",
      email: "user@example.com",
      name: "Budi",
      role: "USER",
    });

    const verified = await verifySessionToken(token);
    expect(verified).toEqual({
      id: "usr_1",
      email: "user@example.com",
      name: "Budi",
      role: "USER",
    });
  });

  it("rejects alg:none forged JWT tokens", async () => {
    const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url");
    const payload = Buffer.from(
      JSON.stringify({ id: "usr_admin", email: "admin@example.com", name: "Admin", role: "ADMIN" })
    ).toString("base64url");
    const unsignedToken = `${header}.${payload}.`;

    expect(await verifySessionToken(unsignedToken)).toBeNull();
  });

  it("rejects tokens signed with a different secret", async () => {
    process.env.JWT_SECRET = "secret-alpha-0123456789-0123456789";
    const token = await signSessionToken({
      id: "usr_1",
      email: "user@example.com",
      name: "Budi",
      role: "USER",
    });

    process.env.JWT_SECRET = "secret-bravo-0123456789-0123456789";
    expect(await verifySessionToken(token)).toBeNull();
  });

  it("unifies effective role resolution from DB role and ADMIN_EMAILS", () => {
    process.env.ADMIN_EMAILS = "admin@lapor.id, sec@lapor.id";
    expect(resolveEffectiveRole("admin@lapor.id", "USER")).toBe("ADMIN");
    expect(resolveEffectiveRole("ADMIN@LAPOR.ID", "USER")).toBe("ADMIN");
    expect(resolveEffectiveRole("regular@lapor.id", "ADMIN")).toBe("ADMIN");
    expect(resolveEffectiveRole("regular@lapor.id", "USER")).toBe("USER");
  });
});

describe("utils (ticketId, formatDate, escapeCsvCell)", () => {
  it("generates 8-char cryptographic ticket IDs with LPR-YYMMDD-XXXXXXXX format", () => {
    const ids = new Set<string>();
    for (let i = 0; i < 50; i++) {
      const id = generateTicketId();
      expect(id).toMatch(/^LPR-\d{6}-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8}$/);
      ids.add(id);
    }
    expect(ids.size).toBe(50);
  });

  it("guards invalid dates in formatDate and returns '-'", () => {
    expect(formatDate("not-a-valid-date")).toBe("-");
    expect(formatDate("")).toBe("-");
    expect(formatDate(new Date("2026-11-25T05:00:00Z"))).not.toBe("-");
  });

  it("neutralizes CSV formula injection prefixes and escapes RFC-4180 quotes/commas", () => {
    expect(escapeCsvCell("=CMD|' /C calc'!A0")).toBe(`"'=CMD|' /C calc'!A0"`);
    expect(escapeCsvCell("+1+1")).toBe(`"'+1+1"`);
    expect(escapeCsvCell("-2+3")).toBe(`"'-2+3"`);
    expect(escapeCsvCell("@SUM(1+1)")).toBe(`"'@SUM(1+1)"`);
    expect(escapeCsvCell("\t=1+1")).toBe(`"'\t=1+1"`);
    expect(escapeCsvCell("\r=1+1")).toBe(`"'\r=1+1"`);
    expect(escapeCsvCell(`hello, "world"`)).toBe(`"hello, ""world"""`);
    expect(escapeCsvCell(null)).toBe(`""`);
    expect(escapeCsvCell(undefined)).toBe(`""`);
  });
});
