import express from "express";
import { get_bid_details } from "../Controllers/bids.js";


const router = express.Router();

router.get("/:id", get_bid_details);


export default router;