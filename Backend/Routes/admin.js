import express from "express";
import { get_all_users, verify_user, suspend_user } from "../Controllers/admin.js";
import { authenticate, requireRole } from "../Middlewares/auth.js";


const router = express.Router();

router.get("/users", get_all_users);
router.patch("/users/:id/verify", verify_user);
router.patch("/users/:id/suspend", suspend_user);

export default router;