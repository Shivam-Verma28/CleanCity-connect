import { type GarbageReport, type InsertGarbageReport, type Admin, type InsertAdmin, garbageReports, admins } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // Garbage Reports
  getGarbageReports(): Promise<GarbageReport[]>;
  getGarbageReport(id: string): Promise<GarbageReport | undefined>;
  createGarbageReport(report: InsertGarbageReport): Promise<GarbageReport>;
  updateGarbageReportStatus(id: string, status: "pending" | "verified" | "in-progress" | "completed"): Promise<GarbageReport | undefined>;
  
  // Admin
  getAdminByEmail(email: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    this.initializeDefaultAdmin();
  }

  private async initializeDefaultAdmin() {
    try {
      const existingAdmin = await this.getAdminByEmail("admin@garbagetracker.com");
      if (!existingAdmin) {
        await this.createAdmin({
          email: "admin@garbagetracker.com",
          password: "admin123", // In production, this should be hashed
        });
      }
    } catch (error) {
      console.log("Admin initialization will be handled on first access");
    }
  }

  async getGarbageReports(): Promise<GarbageReport[]> {
    return await db.select().from(garbageReports).orderBy(desc(garbageReports.createdAt));
  }

  async getGarbageReport(id: string): Promise<GarbageReport | undefined> {
    const [report] = await db.select().from(garbageReports).where(eq(garbageReports.id, id));
    return report || undefined;
  }

  async createGarbageReport(insertReport: InsertGarbageReport): Promise<GarbageReport> {
    const [report] = await db
      .insert(garbageReports)
      .values(insertReport)
      .returning();
    return report;
  }

  async updateGarbageReportStatus(id: string, status: "pending" | "verified" | "in-progress" | "completed"): Promise<GarbageReport | undefined> {
    const now = new Date();
    const updateData: any = {
      status,
      updatedAt: now,
    };
    
    if (status === "verified") {
      updateData.verifiedAt = now;
    }
    if (status === "completed") {
      updateData.completedAt = now;
    }
    
    const [updatedReport] = await db
      .update(garbageReports)
      .set(updateData)
      .where(eq(garbageReports.id, id))
      .returning();
    
    return updatedReport || undefined;
  }

  async getAdminByEmail(email: string): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.email, email));
    return admin || undefined;
  }

  async createAdmin(insertAdmin: InsertAdmin): Promise<Admin> {
    const [admin] = await db
      .insert(admins)
      .values(insertAdmin)
      .returning();
    return admin;
  }
}

export const storage = new DatabaseStorage();
