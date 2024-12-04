import express from "express";
import { registerSeller, login, logout, getSellerBookings} from "../controllers/seller.controller.js";
import { completeBooking, updatePaymentStatus } from "../controllers/booking.controller.js";
import { protectRoute, sellerRoute } from "../middleware/protectRoute.js";
import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage() });
const router=express.Router();


router.post("/becomeseller", protectRoute, upload.single('logo'), registerSeller);
router.post("/login", login);
router.post("/logout", logout);

router.post("/completebooking", protectRoute, completeBooking);
router.post("/booking/update-payment", protectRoute, updatePaymentStatus);
router.get("/bookings", protectRoute, getSellerBookings);
export default router