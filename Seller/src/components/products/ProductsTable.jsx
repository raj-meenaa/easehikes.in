import { motion } from "framer-motion";
import { Edit, Search, Trash2, X, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import AddProductForm from "./addProduct";
import axios from "axios";

const ProductsTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [categories, setCategories] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const response = await axios.get(
            "http://localhost:5001/api/product/allproduct",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setProducts(response.data);
          setFilteredProducts(response.data);
        } else {
          console.error("No token found in localStorage.");
        }
      } catch (error) {
        console.error("Error fetching products:", error.message);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5001/api/admin/categories",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setCategories(response.data.categories);
      } catch (error) {
        console.error("Error fetching categories:", error.message);
      }
    };

    fetchProducts();
    fetchCategories();
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        product.category.name.toLowerCase().includes(term)
    );
    setFilteredProducts(filtered);
  };

  const handleDelete = async (productId) => {
    try {
      await axios.delete(`http://localhost:5001/api/product/${productId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setProducts(products.filter((product) => product._id !== productId));
      setFilteredProducts(
        filteredProducts.filter((product) => product._id !== productId)
      );
    } catch (error) {
      console.error("Error deleting product:", error.message);
    }
  };

  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setEditFormData({
      name: product.name,
      category: product.category._id,
      rent: product.rent,
      securityDeposit: product.securityDeposit,
      stock: product.stock,
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:5001/api/product/${selectedProduct._id}`,
        editFormData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      const updatedProducts = products.map((product) =>
        product._id === selectedProduct._id
          ? { ...product, ...editFormData }
          : product
      );
      setProducts(updatedProducts);
      setFilteredProducts(updatedProducts);
      setSelectedProduct(null);
    } catch (error) {
      console.error("Error updating product:", error.message);
    }
  };

  const closeEditForm = () => {
    setSelectedProduct(null);
  };

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {/* Search, Title, and Add Product Button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-100">Product List</h2>
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              className="bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleSearch}
              value={searchTerm}
            />
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={18}
            />
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded flex items-center gap-2"
          >
            <Plus size={18} /> Add Product
          </button>
        </div>
      </div>

      {/* Table Headers */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Rent
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Security Deposit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          {/* Product Rows */}
          <tbody className="divide-y divide-gray-700">
            {filteredProducts.map((product) => (
              <motion.tr
                key={product._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100 flex gap-2 items-center">
                  <img src={product.image} className="w-10 h-10 rounded-full" />
                  {product.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                  {product.category.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                  {product.rent}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                  {product.securityDeposit}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                  {product.stock}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                  <button
                    onClick={() => handleEditClick(product)}
                    className="text-blue-500 hover:text-blue-700 mx-1"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="text-red-500 hover:text-red-700 mx-1"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Product Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            className="bg-gray-700 p-6 rounded-lg shadow-lg relative w-96"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <button
              onClick={closeEditForm}
              className="absolute top-2 right-2 text-gray-400"
            >
              <X size={24} />
            </button>
            <h3 className="text-lg font-semibold text-gray-100 mb-4">
              Edit Product
            </h3>
            <form onSubmit={handleEditSubmit}>
              <input
                type="text"
                name="name"
                placeholder="Product Name"
                value={editFormData.name}
                onChange={handleEditFormChange}
                className="w-full mb-2 p-2 bg-gray-600 text-white rounded"
              />
              <select
                name="category"
                value={editFormData.category}
                onChange={handleEditFormChange}
                className="w-full mb-2 p-2 bg-gray-600 text-white rounded"
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                name="rent"
                placeholder="Rent"
                value={editFormData.rent}
                onChange={handleEditFormChange}
                className="w-full mb-2 p-2 bg-gray-600 text-white rounded"
              />
              <input
                type="number"
                name="securityDeposit"
                placeholder="Security Deposit"
                value={editFormData.securityDeposit}
                onChange={handleEditFormChange}
                className="w-full mb-2 p-2 bg-gray-600 text-white rounded"
              />
              <input
                type="number"
                name="stock"
                placeholder="Stock"
                value={editFormData.stock}
                onChange={handleEditFormChange}
                className="w-full mb-2 p-2 bg-gray-600 text-white rounded"
              />
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 mt-2 rounded"
              >
                Save Changes
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Add Product Modal */}
      {/* {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            className="bg-gray-700 p-6 rounded-lg shadow-lg relative w-96"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <button
              onClick={() => setShowAddForm(false)}
              className="absolute top-2 right-2 text-gray-400"
            >
              <X size={24} />
            </button>
            <AddProductForm categories={categories} closeForm={() => setShowAddForm(true)} />
          </motion.div>
        </div>
      )} */}
      {showAddForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
          <AddProductForm
            categories={categories} // Pass categories correctly
            onClose={() => setShowAddForm(false)} // Close modal on success or cancel
          />
        </div>
      )}
    </motion.div>
  );
};

export default ProductsTable;
