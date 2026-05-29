import express from "express";
import {
  create_tender,
  get_tender_details,
  get_client_tenders,
  add_boq_item,
  get_tender_boq_items,
  submit_bid,
  get_tender_bids,
  publish_tender,
  get_open_tenders,
  delete_tender,
  update_tender,
  get_client_received_bids,
  cancel_tender,
} from "../Controllers/tenders.js";
import { authenticate, requireRole } from "../Middlewares/auth.js";
import upload from "../Middlewares/upload.js";

const router = express.Router();

router.post("/", authenticate, create_tender);
router.get("/open", get_open_tenders);
router.get("/my-received-bids", authenticate, get_client_received_bids);
router.get("/", get_client_tenders);
router.get("/:id", get_tender_details);
router.post("/:id/boq-items", add_boq_item);
router.get("/:id/boq-items", get_tender_boq_items);
router.post(
  "/:id/submit-bids",
  authenticate,
  upload.fields([
    { name: "technical_document", maxCount: 1 },
    { name: "guarantee_document", maxCount: 1 },
  ]),
  submit_bid,
);
router.get("/:id/bids", get_tender_bids);
router.patch("/:id/publish", publish_tender);
router.delete("/:id", delete_tender);
router.put("/:id", authenticate, requireRole("client"), update_tender);
router.patch("/:id/cancel", authenticate, requireRole("client"), cancel_tender);

export default router;
