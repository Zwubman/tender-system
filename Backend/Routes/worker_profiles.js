import express from "express";
import {
  create_worker_profile,
  get_all_worker_profiles,
  get_worker_profile,
  get_worker_profile_by_id,
  update_worker_profile,
  delete_worker_profile,
  rate_worker,
  get_worker_ratings,
} from "../Controllers/worker_profiles.js";
import { authenticate, requireRole } from "../Middlewares/auth.js";
import upload from "../Middlewares/upload.js";

const router = express.Router();

router.post(
  "/profile",
  upload.fields([
    { name: "experience_document", maxCount: 1 },
    { name: "certificate_file", maxCount: 1 },
  ]),
  create_worker_profile,
);
router.get("/profile", authenticate, requireRole("worker"), get_worker_profile);
router.put(
  "/profile",
  authenticate,
  requireRole("worker"),
  update_worker_profile,
);
router.get("/profiles", get_all_worker_profiles);
router.get("/profile/:id", get_worker_profile_by_id);
router.get("/:id/ratings", get_worker_ratings);
router.delete("/profile", delete_worker_profile);
router.post("/:id/ratings", rate_worker);

export default router;
