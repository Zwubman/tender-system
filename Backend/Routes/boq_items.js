import express from "express";
import { delete_boq_item, update_boq_item } from "../Controllers/boq_items.js";

const router = express.Router();
router.delete("/:id", delete_boq_item);
router.put("/:id", update_boq_item);

export default router;
