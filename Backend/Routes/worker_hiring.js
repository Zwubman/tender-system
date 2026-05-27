import express from "express";
import { get_contractor_worker_hiring } from "../Controllers/worker_hiring.js";
import { authenticate, requireRole } from "../Middlewares/auth.js";

const router = express.Router();

router.get("/", authenticate, get_contractor_worker_hiring);

export default router;