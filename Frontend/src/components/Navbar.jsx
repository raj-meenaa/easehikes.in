import { ShoppingCart, UserPlus, LogIn, LogOut, Package } from "lucide-react";
// import { useEffect, useState } from "react";
// import axios from "axios";
import { Link } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";
import { useCartStore } from "../stores/useCartStore";
// import { useProductStore } from "../stores/useProductStore";
const Navbar = () => {
  const { cart } = useCartStore();

  const { user, logout } = useUserStore();
  // const [order, setOrder] = useState([]);
  // const { fetchAllOrders, orders } = useProductStore();
  //   useEffect(() => {
  //     // Fetch categories and featured products
  //     const fetchOrders = async () => {
  //         try {
  //             // Get the token from localStorage
  //             const token = localStorage.getItem("token");

  //             // If no token, handle the scenario (e.g., redirect to login)
  //             if (!token) {
  //                 console.error("No token found, please log in.");
  //                 return;
  //             }

  //             // Set up the config with Authorization header
  //             const config = {
  //                 headers: {
  //                     Authorization: `Bearer ${token}`,
  //                 },
  //             };

  //             // Make the request with the Authorization header
  //             const response = await axios.get(
  //                 "/order",
  //                 config
  //             );

  //             setOrder(response.data.orders); // Assuming categories are in the response
  //         } catch (error) {
  //             // Log detailed error information
  //             console.error("Error fetching orders:", error.message);
  //             if (error.response) {
  //                 console.error("Response data:", error.response.data);
  //                 console.error("Response status:", error.response.status);
  //                 console.error("Response headers:", error.response.headers);
  //             } else if (error.request) {
  //                 console.error("No response received:", error.request);
  //             } else {
  //                 console.error("Error:", error.message);
  //             }
  //         }
  //     };

  //     fetchAllOrders();
  // }, [fetchAllOrders]);

  return (
    <>
      <header className="fixed top-0 left-0 w-full bg-gray-900 bg-opacity-90 backdrop-blur-md shadow-lg z-40 transition-all duration-300 border-b border-emerald-800">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-wrap justify-between items-center">
            <Link
              to="/"
              className="text-2xl font-bold text-emerald-400 items-center space-x-2 flex"
            >
              <img className=" h-10" src="/common/logo3.png" alt="Ease Hikes" />
            </Link>

            <nav className="flex flex-wrap items-center gap-4">
              <Link
                to={"/"}
                className="text-gray-300 hover:text-emerald-400 transition duration-300
					 ease-in-out"
              >
                Home
              </Link>
              {user && (
                <>
                  <Link
                    to={"/cart"}
                    className="relative group text-gray-300 hover:text-emerald-400 transition duration-300 
							ease-in-out"
                  >
                    <ShoppingCart
                      className="inline-block mr-1 group-hover:text-emerald-400"
                      size={20}
                    />
                    <span className="hidden sm:inline">Cart</span>
                    {cart.length > 0 && (
                      <span
                        className="absolute -top-2 -left-2 bg-emerald-500 text-white rounded-full px-2 py-0.5 
									text-xs group-hover:bg-emerald-400 transition duration-300 ease-in-out"
                      >
                        {cart.length}
                      </span>
                    )}
                  </Link>
                  <Link
                    to={"/order"}
                    className="relative group text-gray-300 hover:text-emerald-400 transition duration-300 
							ease-in-out"
                  >
                    <Package
                      className="inline-block mr-1 group-hover:text-emerald-400"
                      size={20}
                    />
                    <span className="hidden sm:inline">Order</span>
                  </Link>
                </>
              )}
              {user ? (
                <button
                  className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 
						rounded-md flex items-center transition duration-300 ease-in-out"
                  onClick={logout}
                >
                  <LogOut size={18} />
                  <span className="hidden sm:inline ml-2">Log Out</span>
                </button>
              ) : (
                <>
                  <Link
                    to={"/signup"}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 
									rounded-md flex items-center transition duration-300 ease-in-out"
                  >
                    <UserPlus className="mr-2" size={18} />
                    Sign Up
                  </Link>
                  <Link
                    to={"/login"}
                    className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 
									rounded-md flex items-center transition duration-300 ease-in-out"
                  >
                    <LogIn className="mr-2" size={18} />
                    Login
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* For notice and warning */}
      <header className="fixed top-14 left-0 w-full bg-white bg-opacity-90 backdrop-blur-md shadow-lg z-40 transition-all duration-300 border-b border-emerald-800">
        <p className="text-center text-xl text-red-600">
          NOTE: Please Make Payment On Your Own Risk, This Site Is Live Only For
          Testing Purposes
        </p>
      </header>
    </>
  );
};
export default Navbar;
