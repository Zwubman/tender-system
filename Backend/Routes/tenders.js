import express from "express";
import {
  create_tender,
  get_tender_details,
  get_client_tenders,
  add_boq_item,
  get_tender_boq_items,
  submit_bid,
  get_tender_bids,
} from "../Controllers/tenders.js";
import { authenticate, requireRole } from "../Middlewares/auth.js";
import upload from "../Middlewares/upload.js";

const router = express.Router();

router.post("/", create_tender);
router.get("/:id", get_tender_details);
router.get("/", get_client_tenders);
router.post("/:id/boq-items", add_boq_item);
router.get("/:id/boq-items", get_tender_boq_items);
router.post(
  "/:id/bids",
  authenticate,
  requireRole("Contractor", "Admin"),
  upload.fields([
    { name: "technical_document", maxCount: 1 },
    { name: "guarantee_document", maxCount: 1 },
  ]),
  submit_bid
);
router.get("/:id/bids", get_tender_bids);


export default router;
