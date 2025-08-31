import { type GarbageReport, type InsertGarbageReport, type Admin, type InsertAdmin } from "@shared/schema";
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

export class MemStorage implements IStorage {
  private garbageReports: Map<string, GarbageReport>;
  private admins: Map<string, Admin>;

  constructor() {
    this.garbageReports = new Map();
    this.admins = new Map();
    
    // Create default admin
    const defaultAdmin: Admin = {
      id: randomUUID(),
      email: "admin@garbagetracker.com",
      password: "admin123", // In production, this should be hashed
      createdAt: new Date(),
    };
    this.admins.set(defaultAdmin.id, defaultAdmin);
  }

  async getGarbageReports(): Promise<GarbageReport[]> {
    return Array.from(this.garbageReports.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getGarbageReport(id: string): Promise<GarbageReport | undefined> {
    return this.garbageReports.get(id);
  }

  async createGarbageReport(insertReport: InsertGarbageReport): Promise<GarbageReport> {
    const id = randomUUID();
    const now = new Date();
    const report: GarbageReport = {
      ...insertReport,
      id,
      createdAt: now,
      updatedAt: now,
      verifiedAt: null,
      completedAt: null,
    };
    this.garbageReports.set(id, report);
    return report;
  }

  async updateGarbageReportStatus(id: string, status: "pending" | "verified" | "in-progress" | "completed"): Promise<GarbageReport | undefined> {
    const report = this.garbageReports.get(id);
    if (!report) return undefined;

    const now = new Date();
    const updatedReport: GarbageReport = {
      ...report,
      status,
      updatedAt: now,
      verifiedAt: status === "verified" ? now : report.verifiedAt,
      completedAt: status === "completed" ? now : report.completedAt,
    };
    
    this.garbageReports.set(id, updatedReport);
    return updatedReport;
  }

  async getAdminByEmail(email: string): Promise<Admin | undefined> {
    return Array.from(this.admins.values()).find(admin => admin.email === email);
  }

  async createAdmin(insertAdmin: InsertAdmin): Promise<Admin> {
    const id = randomUUID();
    const admin: Admin = {
      ...insertAdmin,
      id,
      createdAt: new Date(),
    };
    this.admins.set(id, admin);
    return admin;
  }
}

export const storage = new MemStorage();
