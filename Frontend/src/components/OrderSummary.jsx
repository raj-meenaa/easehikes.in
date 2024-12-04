import { motion } from "framer-motion";
import { useCartStore } from "../stores/useCartStore";
import { Link } from "react-router-dom";
import { MoveRight } from "lucide-react";
import { useState, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import axios from "../lib/axios";
import toast from "react-hot-toast";
const OrderSummary = () => {
  const { total, subtotal, security, coupon, isCouponApplied, cart } = useCartStore();
  const savings = subtotal+security - total;
  const formattedSubtotal = subtotal.toFixed(2);
  const formattedTotal = total.toFixed(2);
  const formattedSecurity = security.toFixed(2);
  const formattedSavings = savings.toFixed(2);
  const [selectedRange, setSelectedRange] = useState({ from: null, to: null });

  // Handle payment with error catching
  const handlePayment = async () => {
    try {
      const token = localStorage.getItem('token'); // Fetch token from localStorage
      if (!token) throw new Error('No token found');
  
      // Validate selected dates
      const startDate = selectedRange.from; // Extract start date
      const endDate = selectedRange.to; // Extract end date
      if (!startDate || !endDate) throw new Error('Start date and end date must be selected.');
  
      // Prepare the payment data containing all items in the cart
      const paymentData = {
        couponCode:coupon ? coupon.code : null,
        startDate, // Pass the start date
        endDate,   // Pass the end date
        products: cart.map(item => ({
          productId: item._id,  // Product ID
          quantity: item.quantity // Quantity from the cart item
        }))
      };
  
      // Send a single request to create a checkout session for all items
      const response = await axios.post('/payments/create-checkout-session', paymentData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,  // Pass the token for user authentication
        }
      });
  
      // Redirect to the payment page if the payment URL exists
      if (response.data.paymentUrl) {
        window.location.href = response.data.paymentUrl;
      } else {
        throw new Error('Failed to get payment URL');
      }
  
    } catch (error) {
      console.error("Error during payment:", error.response ? error.response.data : error.message);
      toast.error(error.message);
    }
  };
  
  return (
    <motion.div
      className="space-y-4 rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-sm sm:p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Calendar setSelectedRange={setSelectedRange} /> {/* Pass setSelectedRange to Calendar */}
      <p className="text-xl font-semibold text-emerald-400">Order Summary</p>

      <div className="space-y-4">
        <div className="space-y-2">
          <dl className="flex items-center justify-between gap-4">
            <dt className="text-base font-normal text-gray-300">Rent</dt>
            <dd className="text-base font-medium text-white">₹{formattedSubtotal}</dd>
          </dl>
          <dl className="flex items-center justify-between gap-4">
            <dt className="text-base font-normal text-gray-300">Security (Refundable)</dt>
            <dd className="text-base font-medium text-white">₹{formattedSecurity}</dd>
          </dl>

          {savings > 0 && (
            <dl className="flex items-center justify-between gap-4">
              <dt className="text-base font-normal text-gray-300">Savings</dt>
              <dd className="text-base font-medium text-emerald-400">-₹{formattedSavings}</dd>
            </dl>
          )}

          {coupon && isCouponApplied && (
            <dl className="flex items-center justify-between gap-4">
              <dt className="text-base font-normal text-gray-300">Coupon ({coupon.code})</dt>
              <dd className="text-base font-medium text-emerald-400">-{coupon.discountPercentage}%</dd>
            </dl>
          )}
          <dl className="flex items-center justify-between gap-4 border-t border-gray-600 pt-2">
            <dt className="text-base font-bold text-white">Total</dt>
            <dd className="text-base font-bold text-emerald-400">₹{formattedTotal}</dd>
          </dl>
        </div>
        <motion.button
          className="flex w-full items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePayment}
        >
          Proceed to Checkout
        </motion.button>

        <div className="flex items-center justify-center gap-2">
          <span className="text-sm font-normal text-gray-400">or</span>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-emerald-400 underline hover:text-emerald-300 hover:no-underline"
          >
            Continue Shopping
            <MoveRight size={16} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

 const Calendar = ({ setSelectedRange }) => { // Accept setSelectedRange as prop
  const setDayDifference = useCartStore((state) => state.setDayDifference);
  const [cartProducts, setCartProducts] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);
  const [selectedRange, setSelectedRangeState] = useState({ from: null, to: null });
  const today = new Date(); // Get today's date

  useEffect(() => {
    const fetchCartProducts = async () => {
      try {
        const token = localStorage.getItem('token'); // Fetch token from localStorage
        if (!token) throw new Error('No token found');

        const response = await axios.get('http://localhost:5001/api/cart', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setCartProducts(response.data);
        setBlockedDates(extractBlockedDates(response.data));
      } catch (error) {
        console.error('Error fetching cart products:', error.response ? error.response.data : error.message);
      }
    };

    fetchCartProducts();
  }, []);

  // Extract the dates from the bookedSlot array and generate blocked dates
  const extractBlockedDates = (products) => {
    let dates = [];
    products.forEach(product => {
      product.bookedSlot.forEach(slot => {
        let startDate = new Date(slot.from);
        const endDate = new Date(slot.to);

        // Add each day in the range to the blocked dates
        while (startDate <= endDate) {
          dates.push(new Date(startDate));
          startDate.setDate(startDate.getDate() + 1); // Increment date
        }
      });
    });
    return dates;
  };

  // Handle date selection and ensure no blocked dates fall within the selected range
  const handleDateRangeSelection = (range) => {
    if (range.from && range.to) {
      const isBlockedInRange = checkBlockedDatesInRange(range.from, range.to);
      if (isBlockedInRange) {
        toast.error("Product Unavailable for Selected Period")
        setSelectedRangeState({ from: null, to: null }); // Reset the selection
      } else {
        setSelectedRangeState(range); // Set the range if it's valid
        setSelectedRange(range); // Update parent component with selected range
        setDayDifference(range.from, range.to);
      }
    } else {
      setSelectedRangeState(range); // For initial range selection (start date only)
      setSelectedRange(range); // Update parent component with selected range
    }
  };

  // Check if any blocked dates fall between the selected range
  const checkBlockedDatesInRange = (startDate, endDate) => {
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      if (blockedDates.some(blockedDate => blockedDate.getTime() === currentDate.getTime())) {
        return true; // Found a blocked date within the range
      }
      currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
    }
    return false;
  };

  return (
    <div>
      <DayPicker
        mode="range"
        selected={selectedRange}
        onSelect={handleDateRangeSelection}
        disabled={[
          ...blockedDates, // Block booked dates
          { before: today } // Block all past dates
        ]}
        modifiers={{
          blocked: blockedDates.reduce((acc, date) => {
            acc[date.toISOString().split('T')[0]] = true;
            return acc;
          }, {})
        }}
      />
    </div>
  );
};

export default OrderSummary;