import express from "express";
import { get_all_users, verify_user, suspend_user, get_pending_users, get_pending_user_detail } from "../Controllers/admin.js";
import { authenticate, requireRole } from "../Middlewares/auth.js";


const router = express.Router();

router.get("/users", get_all_users);
router.patch("/users/:id/verify", verify_user);
router.patch("/users/:id/suspend", suspend_user);
router.get("/pending-users", get_pending_users);
router.get("/pending-users/:id", get_pending_user_detail);

export default router;