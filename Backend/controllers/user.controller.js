import Booking from "../models/booking.model.js";
import User from "../models/user.model.js";
export const getUserBookings = async (req, res) => {
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const bookings = await Booking.find({ user: userId }).sort({ createdAt: -1 }).populate('product');

    res.status(200).json(bookings);
  } catch (error) {
    console.log('Error in getUserBookings:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
