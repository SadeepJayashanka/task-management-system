import express from "express";
import { getAuditLogs } from "../controllers/auditController";
import { authenticateToken, authorizeAdmin } from "../middleware/auth";

const router = express.Router();

// Only authenticated admins can access
router.get("/", authenticateToken, authorizeAdmin, getAuditLogs);

export default router;
