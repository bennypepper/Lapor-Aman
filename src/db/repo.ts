import { db, users, reports, type User, type NewUser, type Report, type NewReport, type StatusHistoryEntry } from "./index";
import { eq, desc } from "drizzle-orm";
import fs from "fs";
import path from "path";

interface LocalStore {
  users: User[];
  reports: Report[];
}

const LOCAL_DB_PATH = path.join(process.cwd(), "data", "lapor_aman_db.json");

function ensureLocalDir() {
  const dir = path.dirname(LOCAL_DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readLocalStore(): LocalStore {
  ensureLocalDir();
  if (!fs.existsSync(LOCAL_DB_PATH)) {
    const initial: LocalStore = { users: [], reports: [] };
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(initial, null, 2), "utf8");
    return initial;
  }
  try {
    const raw = fs.readFileSync(LOCAL_DB_PATH, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to read local store, resetting:", err);
    return { users: [], reports: [] };
  }
}

function writeLocalStore(data: LocalStore) {
  ensureLocalDir();
  fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2), "utf8");
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
    const newUser: User = {
      id: data.id,
      email: data.email.toLowerCase().trim(),
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

    const store = readLocalStore();
    store.users.push(newUser);
    writeLocalStore(store);
    return newUser;
  },

  async getUserByEmail(email: string): Promise<User | null> {
    const cleanEmail = email.toLowerCase().trim();
    if (db) {
      const results = await db.select().from(users).where(eq(users.email, cleanEmail)).limit(1);
      return results[0] || null;
    }

    const store = readLocalStore();
    return store.users.find((u) => u.email.toLowerCase() === cleanEmail) || null;
  },

  async getUserById(id: string): Promise<User | null> {
    if (db) {
      const results = await db.select().from(users).where(eq(users.id, id)).limit(1);
      return results[0] || null;
    }

    const store = readLocalStore();
    return store.users.find((u) => u.id === id) || null;
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
      ticketId: data.ticketId,
      userId: data.userId || null,
      websiteUrl: data.websiteUrl.trim(),
      category: data.category || "Situs Taruhan / Casino",
      details: data.details.trim(),
      evidenceUrl: data.evidenceUrl || null,
      isAnonymous: Boolean(data.isAnonymous),
      reporterName: data.isAnonymous ? "Anonim" : (data.reporterName || "Anonim"),
      reporterEmail: data.isAnonymous ? "" : (data.reporterEmail || ""),
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

    const store = readLocalStore();
    store.reports.unshift(newReport);
    writeLocalStore(store);
    return newReport;
  },

  async getReportByTicketId(ticketId: string): Promise<Report | null> {
    const cleanId = ticketId.trim().toUpperCase();
    if (db) {
      const results = await db.select().from(reports).where(eq(reports.ticketId, cleanId)).limit(1);
      return results[0] || null;
    }

    const store = readLocalStore();
    return store.reports.find((r) => r.ticketId.toUpperCase() === cleanId) || null;
  },

  async getAllReports(): Promise<Report[]> {
    if (db) {
      return await db.select().from(reports).orderBy(desc(reports.createdAt));
    }

    const store = readLocalStore();
    return [...store.reports].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  async getReportsByUserEmail(email: string): Promise<Report[]> {
    const cleanEmail = email.toLowerCase().trim();
    if (db) {
      return await db
        .select()
        .from(reports)
        .where(eq(reports.reporterEmail, cleanEmail))
        .orderBy(desc(reports.createdAt));
    }

    const store = readLocalStore();
    return store.reports
      .filter((r) => r.reporterEmail?.toLowerCase() === cleanEmail)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async updateReportStatus(
    ticketId: string,
    newStatus: string,
    note?: string,
    updatedBy?: string
  ): Promise<Report | null> {
    const cleanId = ticketId.trim().toUpperCase();
    const now = new Date();

    if (db) {
      const existing = await db.select().from(reports).where(eq(reports.ticketId, cleanId)).limit(1);
      if (!existing.length) return null;

      const report = existing[0];
      const history = (report.statusHistory as StatusHistoryEntry[]) || [];
      const updatedHistory: StatusHistoryEntry[] = [
        ...history,
        {
          status: newStatus,
          timestamp: now.toISOString(),
          note: note || `Status diperbarui menjadi ${newStatus}.`,
          updatedBy: updatedBy || "Administrator",
        },
      ];

      await db
        .update(reports)
        .set({
          status: newStatus,
          statusHistory: updatedHistory,
          updatedAt: now,
        })
        .where(eq(reports.ticketId, cleanId));

      return {
        ...report,
        status: newStatus,
        statusHistory: updatedHistory,
        updatedAt: now,
      };
    }

    const store = readLocalStore();
    const index = store.reports.findIndex((r) => r.ticketId.toUpperCase() === cleanId);
    if (index === -1) return null;

    const report = store.reports[index];
    const history = (report.statusHistory as StatusHistoryEntry[]) || [];
    const updatedHistory: StatusHistoryEntry[] = [
      ...history,
      {
        status: newStatus,
        timestamp: now.toISOString(),
        note: note || `Status diperbarui menjadi ${newStatus}.`,
        updatedBy: updatedBy || "Administrator",
      },
    ];

    report.status = newStatus;
    report.statusHistory = updatedHistory;
    report.updatedAt = now;

    writeLocalStore(store);
    return report;
  },
};
