import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, real, index, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const garbageReports = pgTable("garbage_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  imageUrl: text("image_url").notNull(),
  location: text("location").notNull(),
  latitude: real("latitude"),
  longitude: real("longitude"),
  description: text("description"),
  reporterName: text("reporter_name").notNull(),
  reporterEmail: text("reporter_email").notNull(),
  status: text("status", { enum: ["pending", "verified", "in-progress", "completed"] }).notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  verifiedAt: timestamp("verified_at"),
  completedAt: timestamp("completed_at"),
});

export const admins = pgTable("admins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Session storage table for admin authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

export const insertGarbageReportSchema = createInsertSchema(garbageReports).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  verifiedAt: true,
  completedAt: true,
});

export const insertAdminSchema = createInsertSchema(admins).omit({
  id: true,
  createdAt: true,
});

export type InsertGarbageReport = z.infer<typeof insertGarbageReportSchema>;
export type GarbageReport = typeof garbageReports.$inferSelect;
export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type Admin = typeof admins.$inferSelect;
