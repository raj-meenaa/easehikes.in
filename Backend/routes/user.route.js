import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { getUserBookings } from "../controllers/user.controller.js";

const router=express.Router();
router.get("/", protectRoute, getUserBookings);

export default router
