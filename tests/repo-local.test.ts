import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs";
import os from "os";
import path from "path";
import { dbRepo } from "@/db/repo";

const originalEnv = { ...process.env };
let tempDir: string;
let tempDbPath: string;

beforeEach(() => {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "lapor-aman-test-"));
  tempDbPath = path.join(tempDir, "db.json");
  process.env.LAPOR_AMAN_LOCAL_DB_PATH = tempDbPath;
});

afterEach(() => {
  process.env = { ...originalEnv };
  fs.rmSync(tempDir, { recursive: true, force: true });
});

describe("dbRepo (local store atomicity, constraints & queries)", () => {
  it("fails closed in production when DATABASE_URL is unset", async () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = "production";
    await expect(dbRepo.getAllReports()).rejects.toThrow(/DATABASE_URL/i);
  });

  it("enforces unique case-insensitive email in createUser with Postgres 23505 code", async () => {
    await dbRepo.createUser({
      id: "usr_1",
      email: "User@Example.com",
      name: "User One",
      passwordHash: "hash1",
    });

    await expect(
      dbRepo.createUser({
        id: "usr_2",
        email: "user@example.com",
        name: "User Two",
        passwordHash: "hash2",
      })
    ).rejects.toMatchObject({ code: "23505" });
  });

  it("preserves all statusHistory entries under concurrent updateReportStatus calls", async () => {
    await dbRepo.createReport({
      id: "rep_1",
      ticketId: "LPR-261125-ABCDEFGH",
      websiteUrl: "https://example-judol.test",
      details: "Laporan uji coba untuk konkurensi.",
    });

    await Promise.all([
      dbRepo.updateReportStatus("LPR-261125-ABCDEFGH", "DIVERIFIKASI", "Note 1", "Tim Verifikator"),
      dbRepo.updateReportStatus("LPR-261125-ABCDEFGH", "DITINDAKLANJUTI", "Note 2", "Tim Verifikator"),
      dbRepo.updateReportStatus("LPR-261125-ABCDEFGH", "SELESAI", "Note 3", "Tim Verifikator"),
    ]);

    const updated = await dbRepo.getReportByTicketId("LPR-261125-ABCDEFGH");
    expect(updated).not.toBeNull();
    // 1 initial entry + 3 concurrent updates = 4 total
    expect(updated?.statusHistory).toHaveLength(4);
  });

  it("returns anonymous reports for their owner via getReportsByUserId and excludes other users", async () => {
    await dbRepo.createReport({
      id: "rep_anon",
      ticketId: "LPR-261125-ANON0001",
      userId: "usr_owner",
      websiteUrl: "https://anon-site.test",
      details: "Laporan anonim milik usr_owner.",
      isAnonymous: true,
      reporterEmail: "",
    });

    await dbRepo.createReport({
      id: "rep_other",
      ticketId: "LPR-261125-OTHR0002",
      userId: "usr_other",
      websiteUrl: "https://other-site.test",
      details: "Laporan milik pengguna lain.",
      isAnonymous: false,
      reporterEmail: "other@example.com",
    });

    const ownerReports = await dbRepo.getReportsByUserId("usr_owner");
    expect(ownerReports).toHaveLength(1);
    expect(ownerReports[0].ticketId).toBe("LPR-261125-ANON0001");
    expect(ownerReports[0].isAnonymous).toBe(true);
  });

  it("does not silently wipe an existing corrupted JSON store file", async () => {
    fs.writeFileSync(tempDbPath, "{ corrupted json !!!", "utf8");
    await expect(dbRepo.getAllReports()).rejects.toThrow();
    expect(fs.readFileSync(tempDbPath, "utf8")).toBe("{ corrupted json !!!");
  });
});
