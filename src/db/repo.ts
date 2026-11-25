import {
  db,
  users,
  reports,
  type User,
  type Report,
  type StatusHistoryEntry,
} from "./index";
import { eq, desc, sql } from "drizzle-orm";
import fs from "fs";
import path from "path";

interface LocalStore {
  users: User[];
  reports: Report[];
}

export interface PaginationOptions {
  limit?: number;
  offset?: number;
}

const DEFAULT_LIMIT = 200;
const MAX_LIMIT = 500;

function resolvePagination(opts?: PaginationOptions): { limit: number; offset: number } {
  const rawLimit = opts?.limit ?? DEFAULT_LIMIT;
  const rawOffset = opts?.offset ?? 0;
  const limit = Math.min(MAX_LIMIT, Math.max(1, Math.floor(rawLimit)));
  const offset = Math.max(0, Math.floor(rawOffset));
  return { limit, offset };
}

function getLocalDbPath(): string {
  return process.env.LAPOR_AMAN_LOCAL_DB_PATH || path.join(process.cwd(), "data", "lapor_aman_db.json");
}

function assertLocalStoreAllowed(): void {
  if (process.env.NODE_ENV === "production") {
    throw new Error("DATABASE_URL must be configured in production; local JSON fallback is disabled.");
  }
}

let localLockChain: Promise<void> = Promise.resolve();

function withLocalLock<T>(fn: () => Promise<T> | T): Promise<T> {
  const next = localLockChain.then(fn, fn);
  localLockChain = next.then(
    () => undefined,
    () => undefined
  );
  return next;
}

function ensureLocalDir(dbPath: string): void {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readLocalStore(): LocalStore {
  assertLocalStoreAllowed();
  const dbPath = getLocalDbPath();
  if (!fs.existsSync(dbPath)) {
    return { users: [], reports: [] };
  }
  const raw = fs.readFileSync(dbPath, "utf8");
  if (!raw.trim()) {
    return { users: [], reports: [] };
  }
  const parsed = JSON.parse(raw) as Partial<LocalStore>;
  if (!parsed || !Array.isArray(parsed.users) || !Array.isArray(parsed.reports)) {
    throw new Error("Local store JSON schema is invalid.");
  }
  return {
    users: parsed.users,
    reports: parsed.reports,
  };
}

function writeLocalStore(data: LocalStore): void {
  assertLocalStoreAllowed();
  const dbPath = getLocalDbPath();
  ensureLocalDir(dbPath);
  const tmpPath = `${dbPath}.${process.pid}.${Date.now()}.${Math.random().toString(36).slice(2, 8)}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), "utf8");
  fs.renameSync(tmpPath, dbPath);
}

function createUniqueConstraintError(message: string): Error & { code: string } {
  return Object.assign(new Error(message), { code: "23505" });
}

export const dbRepo = {
  // User operations
  async createUser(data: {
    id: string;
    email: string;
    name: string;
    passwordHash: string;
    role?: string;
    encryptedNik?: string;
    encryptedPhone?: string;
    encryptedAddress?: string;
  }): Promise<User> {
    const now = new Date();
    const cleanEmail = data.email.toLowerCase().trim();
    const newUser: User = {
      id: data.id,
      email: cleanEmail,
      name: data.name.trim(),
      passwordHash: data.passwordHash,
      role: data.role || "USER",
      encryptedNik: data.encryptedNik || "",
      encryptedPhone: data.encryptedPhone || "",
      encryptedAddress: data.encryptedAddress || "",
      createdAt: now,
      updatedAt: now,
    };

    if (db) {
      await db.insert(users).values(newUser);
      return newUser;
    }

    return await withLocalLock(() => {
      const store = readLocalStore();
      if (store.users.some((u) => u.email.toLowerCase() === cleanEmail)) {
        throw createUniqueConstraintError("duplicate key value violates unique constraint users_email_unique");
      }
      store.users.push(newUser);
      writeLocalStore(store);
      return newUser;
    });
  },

  async getUserByEmail(email: string): Promise<User | null> {
    const cleanEmail = email.toLowerCase().trim();
    if (db) {
      const results = await db.select().from(users).where(eq(users.email, cleanEmail)).limit(1);
      return results[0] || null;
    }

    return await withLocalLock(() => {
      const store = readLocalStore();
      return store.users.find((u) => u.email.toLowerCase() === cleanEmail) || null;
    });
  },

  async getUserById(id: string): Promise<User | null> {
    if (db) {
      const results = await db.select().from(users).where(eq(users.id, id)).limit(1);
      return results[0] || null;
    }

    return await withLocalLock(() => {
      const store = readLocalStore();
      return store.users.find((u) => u.id === id) || null;
    });
  },

  // Report operations
  async createReport(data: {
    id: string;
    ticketId: string;
    userId?: string;
    websiteUrl: string;
    category?: string;
    details: string;
    evidenceUrl?: string;
    isAnonymous?: boolean;
    reporterName?: string;
    reporterEmail?: string;
    encryptedPhone?: string;
    encryptedNik?: string;
    encryptedAddress?: string;
    status?: string;
    initialNote?: string;
  }): Promise<Report> {
    const now = new Date();
    const status = data.status || "BARU";
    const initialHistory: StatusHistoryEntry[] = [
      {
        status,
        timestamp: now.toISOString(),
        note: data.initialNote || "Laporan berhasil diterima sistem dan mengantre untuk verifikasi.",
      },
    ];

    const newReport: Report = {
      id: data.id,
      ticketId: data.ticketId.trim().toUpperCase(),
      userId: data.userId || null,
      websiteUrl: data.websiteUrl.trim(),
      category: data.category || "Situs Taruhan / Casino",
      details: data.details.trim(),
      evidenceUrl: data.evidenceUrl || null,
      isAnonymous: Boolean(data.isAnonymous),
      reporterName: data.isAnonymous ? "Anonim" : data.reporterName || "Anonim",
      reporterEmail: data.isAnonymous ? "" : data.reporterEmail || "",
      encryptedPhone: data.encryptedPhone || "",
      encryptedNik: data.encryptedNik || "",
      encryptedAddress: data.encryptedAddress || "",
      status,
      statusHistory: initialHistory,
      createdAt: now,
      updatedAt: now,
    };

    if (db) {
      await db.insert(reports).values(newReport);
      return newReport;
    }

    return await withLocalLock(() => {
      const store = readLocalStore();
      if (store.reports.some((r) => r.ticketId.toUpperCase() === newReport.ticketId)) {
        throw createUniqueConstraintError("duplicate key value violates unique constraint reports_ticket_id_unique");
      }
      store.reports.unshift(newReport);
      writeLocalStore(store);
      return newReport;
    });
  },

  async getReportByTicketId(ticketId: string): Promise<Report | null> {
    const cleanId = ticketId.trim().toUpperCase();
    if (db) {
      const results = await db.select().from(reports).where(eq(reports.ticketId, cleanId)).limit(1);
      return results[0] || null;
    }

    return await withLocalLock(() => {
      const store = readLocalStore();
      return store.reports.find((r) => r.ticketId.toUpperCase() === cleanId) || null;
    });
  },

  async getAllReports(opts?: PaginationOptions): Promise<Report[]> {
    const { limit, offset } = resolvePagination(opts);
    if (db) {
      return await db
        .select()
        .from(reports)
        .orderBy(desc(reports.createdAt))
        .limit(limit)
        .offset(offset);
    }

    return await withLocalLock(() => {
      const store = readLocalStore();
      return [...store.reports]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(offset, offset + limit);
    });
  },

  async countReports(): Promise<number> {
    if (db) {
      const res = await db.select({ count: sql<number>`count(*)::int` }).from(reports);
      return res[0]?.count ?? 0;
    }

    return await withLocalLock(() => {
      const store = readLocalStore();
      return store.reports.length;
    });
  },

  async getReportsByUserId(userId: string, opts?: PaginationOptions): Promise<Report[]> {
    const { limit, offset } = resolvePagination(opts);
    if (db) {
      return await db
        .select()
        .from(reports)
        .where(eq(reports.userId, userId))
        .orderBy(desc(reports.createdAt))
        .limit(limit)
        .offset(offset);
    }

    return await withLocalLock(() => {
      const store = readLocalStore();
      return store.reports
        .filter((r) => r.userId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(offset, offset + limit);
    });
  },

  async getReportsByUserEmail(email: string, opts?: PaginationOptions): Promise<Report[]> {
    const { limit, offset } = resolvePagination(opts);
    const cleanEmail = email.toLowerCase().trim();
    if (db) {
      return await db
        .select()
        .from(reports)
        .where(eq(reports.reporterEmail, cleanEmail))
        .orderBy(desc(reports.createdAt))
        .limit(limit)
        .offset(offset);
    }

    return await withLocalLock(() => {
      const store = readLocalStore();
      return store.reports
        .filter((r) => r.reporterEmail?.toLowerCase() === cleanEmail)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(offset, offset + limit);
    });
  },

  async updateReportStatus(
    ticketId: string,
    newStatus: string,
    note?: string,
    updatedBy?: string
  ): Promise<Report | null> {
    const cleanId = ticketId.trim().toUpperCase();
    const now = new Date();
    const newEntry: StatusHistoryEntry = {
      status: newStatus,
      timestamp: now.toISOString(),
      note: note || `Status diperbarui menjadi ${newStatus}.`,
      updatedBy: updatedBy || "Tim Verifikator",
    };

    if (db) {
      const updated = await db
        .update(reports)
        .set({
          status: newStatus,
          statusHistory: sql`${reports.statusHistory} || ${JSON.stringify([newEntry])}::jsonb`,
          updatedAt: now,
        })
        .where(eq(reports.ticketId, cleanId))
        .returning();
      return updated[0] || null;
    }

    return await withLocalLock(() => {
      const store = readLocalStore();
      const index = store.reports.findIndex((r) => r.ticketId.toUpperCase() === cleanId);
      if (index === -1) return null;

      const report = store.reports[index];
      const history = Array.isArray(report.statusHistory) ? report.statusHistory : [];
      const updatedHistory: StatusHistoryEntry[] = [...history, newEntry];

      const updatedReport: Report = {
        ...report,
        status: newStatus,
        statusHistory: updatedHistory,
        updatedAt: now,
      };
      store.reports[index] = updatedReport;
      writeLocalStore(store);
      return updatedReport;
    });
  },
};
