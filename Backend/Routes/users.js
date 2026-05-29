import express from "express";
import { resubmit_profile, request_otp, verify_otp, reset_password } from "../Controllers/users.js";
import { authenticate } from "../Middlewares/auth.js";

const router = express.Router();

router.post("/request-otp", request_otp);
router.post("/verify-otp", verify_otp);
router.post("/reset-password", reset_password);
router.post("/resubmit-profile", authenticate, resubmit_profile);

export default router;
