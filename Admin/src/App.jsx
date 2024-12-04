import { Route, Routes, Navigate} from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "./components/common/Sidebar";
import LoadingSpinner from "./components/common/LoadingSpinner";
import OverviewPage from "./pages/OverviewPage";
import ProductsPage from "./pages/ProductsPage";
import UsersPage from "./pages/UsersPage";
import CategoryPage from "./pages/CategoryPage"
import SalesPage from "./pages/SalesPage";
import OrdersPage from "./pages/OrdersPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingsPage";
import LoginPage from "./pages/LoginPage";
import axios from "axios";

function App() {
  const [authUser, setAuthUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  

  // Fetch the authenticated user
  useEffect(() => {
    async function fetchAuthUser() {
      try {
        const token = localStorage.getItem("token");
        console.log("Token:", token);
        if (token) {
          // Assuming there's an API endpoint to fetch user details from token
          const response = await axios.get("http://localhost:5001/api/auth/me", {
            headers: {
              Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
            },
          });
          
          // Set authenticated user if token is valid
          setAuthUser(response.data);
          console.log(response.data)
        } else {
          setAuthUser(null);  // No token, no authenticated user
        }
      } catch (error) {
        console.error("Error fetching authenticated user:", error);
        setAuthUser(null); // Error in token or fetching user, reset authUser
      } finally {
        setIsLoading(false); // Stop loading once fetching is done
      }
    }
  
    fetchAuthUser();
  }, []);
  

  // Show a loading spinner while checking for auth state
  if (isLoading) {
    return (
      <div className="h-screen w-screen flex justify-center items-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 overflow-hidden">
      {/* BG */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 opacity-80" />
        <div className="absolute inset-0 backdrop-blur-sm" />
      </div>

      {/* Show Sidebar only when user is authenticated */}
      {authUser && <Sidebar />}

      <Routes>
        {/* Protect the main routes by checking if user is authenticated */}
        <Route path="/" element={authUser ? <OverviewPage /> : <Navigate to="/login" />} />
        <Route path="/products" element={authUser ? <ProductsPage /> : <Navigate to="/login" />} />
        <Route path="/users" element={authUser ? <UsersPage /> : <Navigate to="/login" />} />
        <Route path="/category" element={authUser ? <CategoryPage /> : <Navigate to="/login" />} />
        <Route path="/sales" element={authUser ? <SalesPage /> : <Navigate to="/login" />} />
        <Route path="/orders" element={authUser ? <OrdersPage /> : <Navigate to="/login" />} />
        <Route path="/analytics" element={authUser ? <AnalyticsPage /> : <Navigate to="/login" />} />
        <Route path="/settings" element={authUser ? <SettingsPage /> : <Navigate to="/login" />} />

        {/* Login page should only be accessible if user is not authenticated */}
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;

