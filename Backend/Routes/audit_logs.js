import express from "express";
import { getAuditLogs, getAuditLogById } from "../Controllers/audit_logs.js";
import { authenticate, requireRole } from "../Middlewares/auth.js";

const router = express.Router();

// Admin only routes for audit logs
router.get("/", authenticate, requireRole("admin"), getAuditLogs);
router.get("/:id", authenticate, requireRole("admin"), getAuditLogById);

export default router;
