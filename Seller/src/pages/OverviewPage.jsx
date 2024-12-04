import { BarChart2, ShoppingBag, Users, Zap } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import { useState, useEffect } from "react";
import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";
import SalesOverviewChart from "../components/overview/SalesOverviewChart";
import CategoryDistributionChart from "../components/overview/CategoryDistributionChart";
import SalesChannelChart from "../components/overview/SalesChannelChart";

const OverviewPage = () => {
  const [analytics, setAnalytics] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalSellers: 0,
    totalUsers: 0,
  });
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem("token"); // Retrieve token from localStorage
        if (token) {
          // Include the token in the Authorization header
          const response = await axios.get(
            "http://localhost:5001/api/admin/analytics",
            {
              headers: {
                Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
              },
            }
          );

          setAnalytics(response.data);
        } else {
          console.error("No token found in localStorage.");
        }
      } catch (error) {
        if (error.response) {
          // The request was made and the server responded with a status code
          console.error("Error Response:", error.response.data);
          console.error("Error Status:", error.response.status);
          console.error("Error Headers:", error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received
          console.error("Error Request:", error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error("Error Message:", error.message);
        }
      }
    };

    fetchAnalytics();
  }, []);

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Header title="Overview" />

      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        {/* STATS */}
        <motion.div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <StatCard
            name="Total Sales"
            icon={Zap}
            value={`₹${analytics.totalOrders * 1000}`}
            color="#6366F1"
          />
          <StatCard
            name="New Users"
            icon={Users}
            value={analytics.totalUsers}
            color="#8B5CF6"
          />
          <StatCard
            name="Total Products"
            icon={ShoppingBag}
            value={analytics.totalProducts}
            color="#EC4899"
          />
          <StatCard
            name="Total Sellers"
            icon={BarChart2}
            value={analytics.totalSellers}
            color="#10B981"
          />
        </motion.div>

        {/* CHARTS */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SalesOverviewChart />
          <CategoryDistributionChart />
          <SalesChannelChart />
        </div>
      </main>
    </div>
  );
};
export default OverviewPage;
