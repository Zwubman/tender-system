import express from "express";
import {
  get_contractor_worker_hiring,
  update_worker_hiring_status,
} from "../Controllers/worker_hiring.js";
import { authenticate, requireRole } from "../Middlewares/auth.js";

const router = express.Router();

router.get("/", authenticate, get_contractor_worker_hiring);
router.put("/:id", authenticate, update_worker_hiring_status);
export default router;
