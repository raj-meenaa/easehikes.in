import express from 'express';
import { protectRoute } from '../middleware/protectRoute.js';
import { createBooking, getAllBookings} from '../controllers/booking.controller.js';


const router = express.Router();
router.get('/bookings', protectRoute, getAllBookings);
router.post('/book', protectRoute, createBooking);
export default router;
