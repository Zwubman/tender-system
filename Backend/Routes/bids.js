import express from "express";
import {
  get_bid_details,
  get_contractor_bids,
  update_bid,
  cancel_bid,
  select_bid
} from "../Controllers/bids.js";
import { authenticate } from "../Middlewares/auth.js";
import upload from "../Middlewares/upload.js";

const router = express.Router();

router.get("/", get_contractor_bids);
router.get("/:id", authenticate, get_bid_details);
router.put(
  "/:id",
  authenticate,
  upload.fields([
    { name: "technical_document", maxCount: 1 },
    { name: "guarantee_document", maxCount: 1 },
  ]),
  update_bid,
);
router.delete("/:id", cancel_bid);
router.patch("/:id/select", select_bid);
export default router;
