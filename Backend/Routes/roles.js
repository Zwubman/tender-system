import express from "express";
import {
  create_role,
  get_all_roles,
  get_role_by_id,
  update_role,
  delete_role,
} from "../Controllers/roles.js";

const router = express.Router();

router.post("/", create_role);
router.get("/", get_all_roles);
router.get("/:id", get_role_by_id);
router.put("/:id", update_role);
router.delete("/:id", delete_role);

export default router;
