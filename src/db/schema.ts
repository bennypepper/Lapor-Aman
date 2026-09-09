import { pgTable, text, varchar, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";

export interface StatusHistoryEntry {
  status: string;
  timestamp: string;
  note?: string;
  updatedBy?: string;
}

export const users = pgTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  passwordHash: text("password_hash").notNull(),
  role: varchar("role", { length: 32 }).notNull().default("USER"),
  encryptedNik: text("encrypted_nik").default(""),
  encryptedPhone: text("encrypted_phone").default(""),
  encryptedAddress: text("encrypted_address").default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const reports = pgTable("reports", {
  id: varchar("id", { length: 64 }).primaryKey(),
  ticketId: varchar("ticket_id", { length: 64 }).notNull().unique(),
  userId: varchar("user_id", { length: 64 }),
  websiteUrl: text("website_url").notNull(),
  category: varchar("category", { length: 128 }).notNull().default("Situs Taruhan / Casino"),
  details: text("details").notNull(),
  evidenceUrl: text("evidence_url"),
  isAnonymous: boolean("is_anonymous").default(false).notNull(),
  reporterName: varchar("reporter_name", { length: 255 }).default("Anonim").notNull(),
  reporterEmail: varchar("reporter_email", { length: 255 }).default(""),
  encryptedPhone: text("encrypted_phone").default(""),
  encryptedNik: text("encrypted_nik").default(""),
  encryptedAddress: text("encrypted_address").default(""),
  status: varchar("status", { length: 64 }).default("BARU").notNull(),
  statusHistory: jsonb("status_history").$type<StatusHistoryEntry[]>().default([]).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Report = typeof reports.$inferSelect;
export type NewReport = typeof reports.$inferInsert;
