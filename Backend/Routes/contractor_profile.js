import express from "express";
import {
  create_contractor_profile,
  get_all_contractor_profiles,
  get_contractor_profile,
  update_contractor_profile,
  delete_contractor_profile,
  get_my_profile,
} from "../Controllers/contractor_profiles.js";
import upload from "../Middlewares/upload.js"
import { authenticate, requireRole } from "../Middlewares/auth.js";

const router = express.Router();

router.post("/profile", upload.single("license_document"), create_contractor_profile);
router.get("/profile", get_contractor_profile);
router.get("/profiles", get_all_contractor_profiles);
router.get("/my-profile", authenticate, get_my_profile);
router.put("/profile", authenticate, upload.single("license_document"), update_contractor_profile);
router.delete("/profile", delete_contractor_profile);

export default router;
