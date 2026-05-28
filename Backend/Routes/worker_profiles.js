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
  hire_worker,
  search_workers,
  get_worker_hiring_notifications,
  get_hiring_notification_by_id,
  get_my_profile,
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
  upload.fields([
    { name: "experience_document", maxCount: 1 },
    { name: "certificate_file", maxCount: 1 },
  ]),
  update_worker_profile,
);
router.get("/", get_all_worker_profiles);
router.get("/notifications", authenticate, get_worker_hiring_notifications);
router.get("/notifications/:id", authenticate, get_hiring_notification_by_id);
router.get("/my-profile", authenticate, get_my_profile);
router.get("/search", search_workers);
router.get("/:id", get_worker_profile_by_id);
router.get("/:id/ratings", get_worker_ratings);
router.delete("/profile", delete_worker_profile);
router.post("/:id/ratings", authenticate, rate_worker);
router.post("/:id/hire", authenticate, hire_worker);

export default router;
