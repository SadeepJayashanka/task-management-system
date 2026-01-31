import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { AuditLogModel } from "../models/AuditLog";

export const getAuditLogs = async (req: AuthRequest, res: Response) => {
  try {
    // Only admins can view audit logs
    if (req.user?.role !== "Admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const logs = await AuditLogModel.findAll();
    res.json({ logs });
  } catch (error) {
    console.error("Get audit logs error:", error);
    res.status(500).json({ message: "Failed to fetch audit logs" });
  }
};
