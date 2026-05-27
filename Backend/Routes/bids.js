import express from "express";
import { get_bid_details, get_contractor_bids, } from "../Controllers/bids.js";


const router = express.Router();

router.get("/:id", get_bid_details);
router.get("/", get_contractor_bids);
export default router;