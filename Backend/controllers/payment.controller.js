import Booking from "../models/booking.model.js";
import Coupon from "../models/coupon.model.js"
import crypto from "crypto";
import axios from "axios";
import Product from "../models/product.model.js";
import { blockDates } from '../lib/utils/blockDates.js';


const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID;
const MERCHANT_KEY = process.env.PHONEPE_MERCHANT_KEY;
const SALT_INDEX = process.env.PHONEPE_SALT_INDEX;
const PHONEPE_BASE_URL = process.env.PHONEPE_BASE_URL;


function generateHash(dataString) {
  return crypto.createHash("sha256").update(dataString).digest("hex");
}
function encodeBase64(data) {
  return Buffer.from(data).toString("base64");
}


export const createCheckoutSession = async (req, res) => {
  try {
    const { products, startDate, endDate, couponCode } = req.body;

    // Validate request data
    if (!products || products.length === 0 || !startDate || !endDate) {
      return res.status(400).json({ error: "Missing or invalid request data. Ensure products, start date, and end date are provided." });
    }

    // Convert date strings to Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();

    // Check if the dates are valid
    if (start < today || end < start) {
      return res.status(400).json({ error: 'Invalid dates selected' });
    }

    let totalRent = 0;
    let totalSecurity = 0;

    const customerName = req.user.fullName;
    const customerEmail = req.user.email;
    const customerMobile = req.user.number;
    const transactionId = `ORDER_${req.user._id.toString().slice(0, 8)}_${Date.now().toString().slice(-8)}`;

    // Initialize an empty array to hold products for the booking
    let bookingProducts = [];

    // Loop through each product in the request
    for (const item of products) {
      const { productId, quantity } = item;

      // Find the product by ID
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ error: `Product with ID ${productId} not found` });
      }

      // Calculate the rent and security for each product
      const dayDifference = (end - start) / (1000 * 60 * 60 * 24);
      const rentForProduct = product.rent * dayDifference * quantity;
      const securityForProduct = product.securityDeposit;

      // Add to the total amounts
      totalRent += rentForProduct;
      totalSecurity += securityForProduct;

      // Add this product to the bookingProducts array
      bookingProducts.push({
        product: productId,
        quantity,
      });

      // Block dates for this product
      await blockDates(productId, start, end, req.user._id, quantity);
    }

    // Calculate the total amount (in INR, converted to paisa for payment processing)
    const totalAmount = totalRent + totalSecurity;
    let amountInPaisa = Math.round(totalAmount * 100);  // Convert INR to paisa
    let coupon = null;
		if (couponCode) {
			coupon = await Coupon.findOne({ code: couponCode, userId: req.user._id, isActive: true });
			if (coupon) {
        const discount = totalRent * (coupon.discountPercentage / 100);
				amountInPaisa = Math.round((totalAmount-discount) * 100);
			}
		}
    // Save booking data in the database (before payment)
    const newBooking = new Booking({
      user: req.user._id,
      product: bookingProducts,
      startDate: start,
      endDate: end,
      amountPaid: 0,  // Initially no payment
      rentAmount: totalRent,
      securityAmount: totalSecurity,
      totalAmount: totalAmount,  // Amount in INR
      customerName,
      customerEmail,
      customerMobile,
      status: "Pending",  // Payment status starts as pending
    });

    await newBooking.save();

    // Prepare product and payment details for PhonePe

    const productDetails = await Promise.all(
      products.map(async (item) => {
        const product = await Product.findById(item.productId);
        const dayDifference = (end - start) / (1000 * 60 * 60 * 24); // Calculate day difference for rent
        return {
          name: product.name,
          quantity: item.quantity,
          price: product.rent * dayDifference,  // Rent price for product
        };
      })
    );
    const paymentDetails = {
      merchantId: MERCHANT_ID,
      merchantTransactionId: transactionId,
      amount: amountInPaisa,  // Amount in paisa
      merchantUserId: req.user._id,
      merchantOrderId: transactionId,
      redirectUrl: `${process.env.CLIENT_URL}/payment-success?transaction_id=${transactionId}&booking_id=${newBooking._id}`, // Your payment success URL
      paymentInstrument: {
        type: "PAY_PAGE",
      },
      products: productDetails,
    };

    // Prepare the payload for PhonePe
    const paymentDetailsString = JSON.stringify(paymentDetails);
    const encodedPayload = encodeBase64(paymentDetailsString);
    const xVerifyString = `${encodedPayload}/pg/v1/pay${MERCHANT_KEY}`;
    const hash = generateHash(xVerifyString);
    const xVerifyHeader = `${hash}###${SALT_INDEX}`;

    // Make the request to PhonePe
    const response = await axios.post(
      `${PHONEPE_BASE_URL}`,
      { request: encodedPayload },
      {
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": xVerifyHeader,
        },
      }
    );

    // Log the full response for debugging
    console.log("Response: ", response.data);

    // Check if the response is successful
    if (response.data.success) {
      const redirectInfo = response.data.data.instrumentResponse.redirectInfo;

      // Send the PhonePe payment URL for frontend redirection
      return res.status(200).json({
        paymentUrl: redirectInfo.url,  // PhonePe URL for payment
        bookingId: newBooking._id,  // Return booking ID for reference
        totalAmount: totalAmount,
      });
    } else {
      // Handle unsuccessful payment initiation
      console.error("Error initiating checkout: ", response.data.message);
      return res.status(400).json({ error: "Failed to create PhonePe checkout session" });
    }
  } catch (error) {
    console.error("Error initiating checkout:", error.response ? error.response.data : error.message);
    return res.status(500).json({ error: "Failed to initiate checkout" });
  }
};




export const checkoutSuccess = async (req, res) => {
  try {
    const { merchantTransactionId, bookingId } = req.body;


    // Validate input
    if (!merchantTransactionId || !bookingId) {
      return res.status(400).json({ error: "Missing transactionId or bookingId" });
    }
    function generateXVerify(transactionId) {
      const statusVerifyString = `/pg/v1/status/${MERCHANT_ID}/${transactionId}${MERCHANT_KEY}`;
      const hash = generateHash(statusVerifyString);
      return `${hash}###${SALT_INDEX}`;
    }
    // Generate X-VERIFY hash
    const xVerifyHeader = generateXVerify(merchantTransactionId);
    // Send request to PhonePe to check payment status
    const paymentStatusResponse = await axios.get(
      `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": xVerifyHeader,
          "X-MERCHANT-ID": MERCHANT_ID, // This header is also required as per documentation
        },
      }
    );

    // Extract the response data
    const statusData = paymentStatusResponse.data;
    // Check if payment is successful
    if (statusData.success && statusData.data.state === "COMPLETED") {
      const amountPaid = statusData.data.amount / 100;  // Assuming amount is in paise, convert to INR
      // Find the booking by ID and update the status
      const booking = await Booking.findById(bookingId);

      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      booking.amountPaid = amountPaid;
      booking.status = "Paid"; // Mark the payment status as Paid
      await booking.save();

      // Return success response
      res.status(200).json({
        success: true,
        message: "Payment successful and booking updated",
        bookingId: booking._id,
      });
    } else {
      res.status(400).json({ error: "Payment failed or not completed" });
    }
  } catch (error) {
    console.error("Error processing payment success:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: "Error processing payment success" });
  }
};