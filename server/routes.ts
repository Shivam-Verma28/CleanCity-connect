import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGarbageReportSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import { promises as fs } from "fs";

// Configure multer for file uploads
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// Simple session storage for admin auth
const adminSessions = new Map<string, { adminId: string; expiresAt: Date }>();

function generateSessionId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function isAuthenticated(req: any): boolean {
  const sessionId = req.headers.authorization?.replace("Bearer ", "");
  if (!sessionId) return false;
  
  const session = adminSessions.get(sessionId);
  if (!session || session.expiresAt < new Date()) {
    if (session) adminSessions.delete(sessionId);
    return false;
  }
  
  return true;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Ensure uploads directory exists
  try {
    await fs.mkdir("uploads", { recursive: true });
  } catch (error) {
    // Directory might already exist
  }

  // Serve uploaded images
  app.use("/uploads", (req, res, next) => {
    const imagePath = path.join(process.cwd(), "uploads", req.path);
    res.sendFile(imagePath, (err) => {
      if (err) {
        res.status(404).json({ message: "Image not found" });
      }
    });
  });

  // Get all garbage reports
  app.get("/api/reports", async (req, res) => {
    try {
      const reports = await storage.getGarbageReports();
      res.json(reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  // Get single garbage report
  app.get("/api/reports/:id", async (req, res) => {
    try {
      const report = await storage.getGarbageReport(req.params.id);
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }
      res.json(report);
    } catch (error) {
      console.error("Error fetching report:", error);
      res.status(500).json({ message: "Failed to fetch report" });
    }
  });

  // Create new garbage report
  app.post("/api/reports", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Image is required" });
      }

      const reportData = {
        imageUrl: `/uploads/${req.file.filename}`,
        location: req.body.location,
        latitude: req.body.latitude ? parseFloat(req.body.latitude) : null,
        longitude: req.body.longitude ? parseFloat(req.body.longitude) : null,
        description: req.body.description || null,
        reporterName: req.body.reporterName,
        reporterEmail: req.body.reporterEmail,
        status: "pending" as const,
      };

      const validatedData = insertGarbageReportSchema.parse(reportData);
      const report = await storage.createGarbageReport(validatedData);
      
      res.status(201).json(report);
    } catch (error) {
      console.error("Error creating report:", error);
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid data provided" });
      }
      res.status(500).json({ message: "Failed to create report" });
    }
  });

  // Update report status (admin only)
  app.patch("/api/reports/:id/status", async (req, res) => {
    try {
      if (!isAuthenticated(req)) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { status } = req.body;
      if (!["pending", "verified", "in-progress", "completed"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const report = await storage.updateGarbageReportStatus(req.params.id, status);
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }

      res.json(report);
    } catch (error) {
      console.error("Error updating report status:", error);
      res.status(500).json({ message: "Failed to update report status" });
    }
  });

  // Admin login
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const admin = await storage.getAdminByEmail(email);
      if (!admin || admin.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const sessionId = generateSessionId();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      
      adminSessions.set(sessionId, { adminId: admin.id, expiresAt });
      
      res.json({ sessionId, admin: { id: admin.id, email: admin.email } });
    } catch (error) {
      console.error("Error during admin login:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Admin logout
  app.post("/api/admin/logout", async (req, res) => {
    try {
      const sessionId = req.headers.authorization?.replace("Bearer ", "");
      if (sessionId) {
        adminSessions.delete(sessionId);
      }
      res.json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Error during admin logout:", error);
      res.status(500).json({ message: "Logout failed" });
    }
  });

  // Get admin session info
  app.get("/api/admin/me", async (req, res) => {
    try {
      if (!isAuthenticated(req)) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      res.json({ authenticated: true });
    } catch (error) {
      console.error("Error checking admin session:", error);
      res.status(500).json({ message: "Failed to check session" });
    }
  });

  // Get report statistics (admin only)
  app.get("/api/admin/stats", async (req, res) => {
    try {
      if (!isAuthenticated(req)) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const reports = await storage.getGarbageReports();
      const stats = {
        pending: reports.filter(r => r.status === "pending").length,
        verified: reports.filter(r => r.status === "verified").length,
        inProgress: reports.filter(r => r.status === "in-progress").length,
        completed: reports.filter(r => r.status === "completed").length,
        total: reports.length,
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
