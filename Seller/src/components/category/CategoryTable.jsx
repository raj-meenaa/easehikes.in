import { motion } from "framer-motion";
import { Search} from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
const CategoryTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const token = localStorage.getItem("token"); // Retrieve token from localStorage
        if (token) {
          // Include the token in the Authorization header
          const response = await axios.get(
            "http://localhost:5001/api/admin/categories",
            {
              headers: {
                Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
              },
            }
          );

          // Check if the response contains the categories array
          const categories = response.data.categories;
          if (Array.isArray(categories)) {
            setCategories(categories);
            setFilteredCategories(categories);
          } else {
            console.error("Unexpected response format:", response.data);
          }
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

    fetchCategory();
  }, []);

  // Handle search filter
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = categories.filter(
      (category) =>
        category.name.toLowerCase().includes(term)
        // category.category.name.toLowerCase().includes(term)
    );
    setFilteredCategories(filtered);
  };

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-100">Category List</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search categories..."
            className="bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={handleSearch}
            value={searchTerm}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Category ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Products
              </th>
              
              
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-700">
            {filteredCategories.map((category) => (
              <motion.tr
                key={category._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100 flex gap-2 items-center">
                  <img
                    src={category.image}
                    alt="Product img"
                    className="size-10 rounded-full"
                  />
                  {category.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {category._id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {category.productCount}
                </td>

                
                
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};
export default CategoryTable;
