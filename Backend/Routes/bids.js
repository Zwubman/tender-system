import express from "express";
import {
  get_bid_details,
  get_contractor_bids,
  update_bid,
  cancel_bid,
} from "../Controllers/bids.js";

const router = express.Router();

router.get("/:id", get_bid_details);
router.get("/", get_contractor_bids);
router.put("/:id", update_bid);
router.delete("/:id", cancel_bid);
export default router;
