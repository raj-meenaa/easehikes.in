import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import axios from "axios";

const COLORS = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FED766", "#2AB7CA"];

const OrderDistribution = () => {
  const [orderStatusData, setOrderStatusData] = useState([]);
  const [bookings, setBookings] = useState([]);

  // Fetch bookings with authorization token
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("token"); // Retrieve token from localStorage
        if (token) {
          // Include the token in the Authorization header
          const response = await axios.get('http://localhost:5001/api/user/bookings', {
            headers: {
              Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
            },
          });

          const bookingsData = response.data.bookings;

          if (Array.isArray(bookingsData)) {
            setBookings(bookingsData);
            calculateStatusDistribution(bookingsData); // Calculate the order status distribution
          } else {
            console.error("Unexpected response format:", response.data);
          }
        } else {
          console.error("No token found in localStorage.");
        }
      } catch (error) {
        if (error.response) {
          console.error("Error Response:", error.response.data);
          console.error("Error Status:", error.response.status);
        } else if (error.request) {
          console.error("Error Request:", error.request);
        } else {
          console.error("Error Message:", error.message);
        }
      }
    };

    fetchBookings();
  }, []);

  // Calculate the order status distribution
  const calculateStatusDistribution = (bookings) => {
    const statusCount = {
      Pending: 0,
      "Partially Paid": 0,
      Paid: 0,
      Delivered: 0,
      Completed: 0,
    };

    bookings.forEach((booking) => {
      const { status } = booking;
      if (statusCount[status] !== undefined) {
        statusCount[status] += 1;
      }
    });

    // Convert to Recharts-friendly format
    const chartData = Object.keys(statusCount).map((key) => ({
      name: key,
      value: statusCount[key],
    }));

    setOrderStatusData(chartData);
  };

  return (
    <motion.div
      className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <h2 className='text-xl font-semibold text-gray-100 mb-4'>Order Status Distribution</h2>
      <div style={{ width: "100%", height: 300 }}>
        {orderStatusData.length > 0 ? (
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={orderStatusData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {orderStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(31, 41, 55, 0.8)",
                  borderColor: "#4B5563",
                }}
                itemStyle={{ color: "#E5E7EB" }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-400">Loading...</p>
        )}
      </div>
    </motion.div>
  );
};

export default OrderDistribution;

