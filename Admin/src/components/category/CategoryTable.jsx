import { motion } from "framer-motion";
import { Edit, Search, Trash2, PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import AddCategoryForm from "./AddCategoryForm";
import EditCategoryForm from "./EditCategoryForm";

const CategoryTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);
  const [showEditCategoryForm, setShowEditCategoryForm] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);

  // Fetch categories from the backend
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const response = await axios.get("http://localhost:5001/api/admin/categories", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const categories = response.data.categories;
        setCategories(categories);
        setFilteredCategories(categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Search filter for categories
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = categories.filter((category) =>
      category.name.toLowerCase().includes(term)
    );
    setFilteredCategories(filtered);
  };

  // Open and close modal functions
  const handleAddCategory = () => setShowAddCategoryForm(true);
  const handleCloseForm = () => {
    setShowAddCategoryForm(false);
    setShowEditCategoryForm(false);
    fetchCategories();  // Refetch categories to update the list
  };

  const handleEditCategory = (category) => {
    setCategoryToEdit(category);
    setShowEditCategoryForm(true);
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5001/api/admin/deletecategory/${categoryId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
    }
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
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
          onClick={handleAddCategory}
        >
          <PlusCircle size={20} />
          Add Category
        </button>
      </div>

      {/* Add and Edit Category Forms as Modals */}
      {showAddCategoryForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
          <AddCategoryForm onClose={handleCloseForm} />
        </div>
      )}
      {showEditCategoryForm && categoryToEdit && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
          <EditCategoryForm category={categoryToEdit} onClose={handleCloseForm} onUpdate={fetchCategories} />
        </div>
      )}

      {/* Category Table */}
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
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
                  <img src={category.image} alt="Category img" className="size-10 rounded-full" />
                  {category.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{category._id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{category.productCount}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  <button className="text-indigo-400 hover:text-indigo-300 mr-2" onClick={() => handleEditCategory(category)}>
                    <Edit size={18} />
                  </button>
                  <button className="text-red-400 hover:text-red-300" onClick={() => handleDeleteCategory(category._id)}>
                    <Trash2 size={18} />
                  </button>
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
