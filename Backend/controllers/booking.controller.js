import Booking from '../models/booking.model.js';
import Product from '../models/product.model.js';
import User from '../models/user.model.js';
import { blockDates } from '../lib/utils/blockDates.js';



export const createBooking = async (req, res) => {
  try {
    const { productId, startDate, endDate, amountPaid, qty, customerName, customerEmail, customerMobile } = req.body;
    const userId = req.user._id;
    const user = await User.findById(userId);

    // Convert date strings to Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();

    // Check if the dates are valid
    if (start < today || end < start) {
      return res.status(400).json({ error: 'Invalid dates selected' });
    }

    // Check for product availability and block dates
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Calculate total rent amount based on the number of days and quantity
    const dayDifference = (end - start) / (1000 * 60 * 60 * 24);
    const rentAmount = product.rent * dayDifference * qty;
    const securityAmount = product.securityDeposit;
    const totalAmount = rentAmount + securityAmount;
    // Check if the minimum amount paid is valid
    if (amountPaid < 300) {
      return res.status(400).json({ error: 'Minimum payment amount is 300' });
    }
    // const minimumAmountPaid = amountPaid >= 300 ? amountPaid : 300;
  

    
    
    // Create booking
    let booking;
    if (user.role === 'admin' || user.role === 'seller') {
      // Offline booking
      if (user.role === 'seller' && product.seller.toString() !== user.sellerId.toString()) {
        return res.status(403).json({ error: 'Sellers can only book their own products' });
      }

      booking = new Booking({
        user: userId,
        product: productId,
        qty,
        startDate: start,
        endDate: end,
        amountPaid,
        rentAmount,
        securityAmount,
        totalAmount,
        customerName,
        customerEmail,
        customerMobile,
      });
    } else {
      // Online booking
      booking = new Booking({
        user: userId,
        product: productId,
        qty,
        startDate: start,
        endDate: end,
        amountPaid,
        rentAmount,
        securityAmount,
        totalAmount,
        customerName: user.fullName, // Use the logged-in user's details
        customerEmail: user.email,
        customerMobile: user.number, // Assuming the User model has a mobile field
      });
    }
    
    if (booking.amountPaid >= booking.totalAmount) {
      booking.status = 'Paid';
    } else if (booking.amountPaid >= 300) {
      booking.status = 'Partially Paid';
    }
    
    await blockDates(productId, start, end, booking._id, qty);
    await booking.save();
    res.status(201).json({ success: true, booking });
  } catch (error) {
    console.log("Error in createBooking:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};




export const getAllBookings = async (req, res) => {
  try {
    // Fetch user details to check role
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.role === 'seller') {
      // Fetch only bookings for products that belong to the seller
      const bookings = await Booking.find().populate({
        path: 'product',
        match: { seller: user.sellerId },  // Match seller's ID with product's seller field
      });

      // Filter out bookings where the product is null (products that don't belong to the seller)
      const filteredBookings = bookings.filter(booking => booking.product !== null);
      
      const bookingCount = filteredBookings.length;

      return res.status(200).json({
        success: true,
        bookingCount,
        bookings: filteredBookings,
      });
    } else {
      // If the user is not a seller, block access or return a different response
      return res.status(403).json({ error: "Access denied. Only sellers can view bookings for their products." });
    }

  } catch (error) {
    console.log("Error in getAllBookings controller ", error.message);
    return res.status(500).json({ error: "Internal server error." });
  }
};



export const updatePaymentStatus = async (req, res) => {
  const { bookingId, amountPaid } = req.body;
  const userId = req.user._id;

  try {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const product = await Product.findById(booking.product._id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    // Check user role and authorization
    if (user.role !== 'admin' && product.seller.toString() !== user.sellerId.toString()) {
      return res.status(403).json({ error: 'You are not authorized to update this booking.' });
    }

    const parsedAmountPaid = parseFloat(amountPaid);
    if (isNaN(parsedAmountPaid)) {
      return res.status(400).json({ error: 'Invalid amount paid.' });
    }

    // Update the amount paid and booking status
    booking.amountPaid += parsedAmountPaid;

    if (booking.amountPaid >= booking.totalAmount) {
      booking.status = 'Paid';
    } else if (booking.amountPaid >= 300) {
      booking.status = 'Partially Paid';
    }

    await booking.save();

    res.status(200).json({ message: 'Booking payment status updated.', booking });
  } catch (error) {
    console.log('Error in updatePaymentStatus:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};







// Capture the payment when the product is returned and handle refunds if the product is damaged.
export const completeBooking = async (req, res) => {
  const { bookingId, isProductDamaged, damageFee } = req.body;
  const userId = req.user._id;

  try {
    const booking = await Booking.findById(bookingId).populate('product');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const product = await Product.findById(booking.product._id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    // Check user role and authorization
    if (user.role !== 'admin' && product.seller.toString() !== user.sellerId.toString()) {
      return res.status(403).json({ error: 'You are not authorized to complete this booking.' });
    }

    // Update approval status based on user role
    if (user.role === 'admin') {
      booking.adminApproval = true;
    }

    if (product.seller.toString() === user.sellerId.toString()) {
      booking.sellerApproval = true;
    }

    // Set the product damage status if provided
    if (isProductDamaged !== undefined) {
      booking.isProductDamaged = isProductDamaged;
      if (isProductDamaged && damageFee !== undefined) {
        booking.damageFee = damageFee;
      }
    }

    // If both admin and seller have approved, complete the booking
    if (booking.adminApproval || booking.sellerApproval) {
      booking.status = 'Completed';

      // Handle refund logic
      const securityAmount = booking.securityAmount;
      let refundableAmount = securityAmount;

      if (booking.isProductDamaged) {
        // Deduct damage fees from the security deposit and refund the rest
        const damageFees = booking.damageFee || 0;
        refundableAmount = Math.max(0, securityAmount - damageFees);

        // await stripe.refunds.create({
        //   payment_intent: booking.paymentIntentId,
        //   amount: refundableAmount * 100, // Amount in cents
        // });

        // Save the booking
        await booking.save();

        return res.status(200).json({ message: 'Booking completed successfully. Partial refund issued due to product damage.', booking });
      } else {
        // Full security refund
        // await stripe.refunds.create({
        //   payment_intent: booking.paymentIntentId,
        //   amount: refundableAmount * 100, // Amount in cents
        // });

        // Save the booking
        await booking.save();

        return res.status(200).json({ message: 'Booking completed successfully. Full refund issued.', booking });
      }
    } else {
      await booking.save();
      return res.status(200).json({ message: 'Booking approval status updated.', booking });
    }
  } catch (error) {
    console.log('Error in completeBooking:', error.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
