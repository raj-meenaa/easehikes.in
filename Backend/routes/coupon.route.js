import express from "express";
import { adminRoute, protectRoute } from "../middleware/protectRoute.js";
import { createCoupon, getCoupon, validateCoupon } from "../controllers/coupon.controller.js";

const router = express.Router();
router.post("/", protectRoute, adminRoute, createCoupon)
router.get("/", protectRoute, getCoupon);
router.post("/validate", protectRoute, validateCoupon);

export default router;
