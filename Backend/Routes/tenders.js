import express from "express";
import {
  create_tender,
  get_tender_details,
  get_client_tenders,
  add_boq_item,
} from "../Controllers/tenders.js";

const router = express.Router();

router.post("/", create_tender);
router.get("/:id", get_tender_details);
router.get("/", get_client_tenders);
router.post("/:id/boq-items", add_boq_item);
export default router;
