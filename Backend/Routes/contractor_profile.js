import express from "express";
import {
  create_contractor_profile,
  get_all_contractor_profiles,
  get_contractor_profile,
  update_contractor_profile,
  delete_contractor_profile,
} from "../Controllers/contractor_profiles.js";
import upload from "../Middlewares/upload.js"

const router = express.Router();

router.post("/profile", upload.single("license_document"), create_contractor_profile);
router.get("/profile", get_contractor_profile);
router.get("/profiles", get_all_contractor_profiles);
router.put("/profile", update_contractor_profile);
router.delete("/profile", delete_contractor_profile);

export default router;
