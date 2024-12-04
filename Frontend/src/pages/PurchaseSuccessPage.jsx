import { ArrowRight, CheckCircle, HandHeart } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCartStore } from "../stores/useCartStore";
import axios from "../lib/axios";
import Confetti from "react-confetti";

const PurchaseSuccessPage = () => {
  const [isProcessing, setIsProcessing] = useState(true);
  const { clearCart } = useCartStore();
  const [error, setError] = useState(null);
  const [merchantTransactionId, setMerchantTransactionId] = useState(null);
  const [bookingId, setBookingId] = useState(null);

  // This useEffect handles setting the IDs from the URL
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const transactionId = searchParams.get("transaction_id");
    const id = searchParams.get("booking_id");
    if (transactionId && id) {
      setMerchantTransactionId(transactionId);
      setBookingId(id);
    } else {
      setError("No transaction ID or booking ID found in the URL.");
      setIsProcessing(false);
    }
  }, []);

  // This useEffect handles the API call after IDs are set
  useEffect(() => {
    const handleCheckoutSuccess = async () => {
      if (!merchantTransactionId || !bookingId) return; // Early return if IDs are not set

      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Unauthorized: No token provided.");


        // Send the payment data to the backend
        const response = await axios.post(
          "/payments/checkout-success",
          {
            merchantTransactionId,
            bookingId,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Response from backend:", response.data);
        clearCart();
      } catch (error) {
        if (error.response) {
          if (error.response.status === 400) {
            setError("Bad request: Please check your payment details.");
          } else if (error.response.status === 401) {
            setError("Unauthorized: Please log in again.");
          } else {
            setError("There was a problem processing your payment.");
          }
        } else {
          setError("Network error: Unable to connect to the server.");
        }
        console.error("Error during checkout success:", error);
      } finally {
        setIsProcessing(false);
      }
    };

    // Call the function only if both IDs are available
    if (merchantTransactionId && bookingId) {
      handleCheckoutSuccess();
    }
  }, [merchantTransactionId, bookingId, clearCart]); // Dependencies include the IDs and clearCart

  if (isProcessing) return "Processing your payment...";

  if (error) return <div>Error: {error}</div>;

  return (
    <div className="h-screen flex items-center justify-center px-4">
      <Confetti
        width={window.innerWidth}
        height={window.innerHeight}
        gravity={0.1}
        style={{ zIndex: 99 }}
        numberOfPieces={700}
        recycle={false}
      />
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl overflow-hidden relative z-10">
        <div className="p-6 sm:p-8">
          <div className="flex justify-center">
            <CheckCircle className="text-emerald-400 w-16 h-16 mb-4" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-center text-emerald-400 mb-2">
            Purchase Successful!
          </h1>
          <p className="text-gray-300 text-center mb-2">
            Thank you for your order. We're processing it now.
          </p>
          <p className="text-emerald-400 text-center text-sm mb-6">
            Check your email for order details and updates.
          </p>
          <div className="bg-gray-700 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Order number</span>
              <span className="text-sm font-semibold text-emerald-400">
                {bookingId}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Estimated delivery</span>
              <span className="text-sm font-semibold text-emerald-400">
                3-5 business days
              </span>
            </div>
          </div>
          <div className="space-y-4">
            <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center">
              <HandHeart className="mr-2" size={18} />
              Thanks for trusting us!
            </button>
            <Link
              to="/"
              className="w-full bg-gray-700 hover:bg-gray-600 text-emerald-400 font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center"
            >
              Continue Shopping
              <ArrowRight className="ml-2" size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseSuccessPage;
