import express from "express";
import {
  create_client_profile,
  get_client_profile,
  get_all_client_profiles,
  update_client_profile,
  delete_client_profile,
  get_my_profile,
} from "../Controllers/client_profiles.js";
import upload from "../Middlewares/upload.js";
import { authenticate, requireRole } from "../Middlewares/auth.js";

const router = express.Router();

router.post(
  "/profile",
  upload.fields([
    { name: "business_license", maxCount: 1 },
    { name: "id_certificate", maxCount: 1 },
  ]),
  create_client_profile,
);
router.get("/profile", get_client_profile);
router.get("/profiles", get_all_client_profiles);
router.get("/my-profile", authenticate, get_my_profile);
router.put(
  "/profile",
  authenticate,
  upload.fields([
    { name: "business_license_file", maxCount: 1 },
    { name: "id_certificate_file", maxCount: 1 },
  ]),
  update_client_profile
);
router.delete("/profile", delete_client_profile);

export default router;
