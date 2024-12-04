import { useState} from "react";
import axios from "axios"
import LoadingSpinner from "../common/LoadingSpinner";

const AddProductForm = ({categories, onClose}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    rent: "",
    securityDeposit: "",
    description: "",
    image: null, 
    stock: 1,
  });
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });  // Store the selected image file
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
   
    const token = localStorage.getItem("token");
    const data = new FormData();
  
    // Append form data
    data.append("name", formData.name);
    data.append("categoryId", formData.categoryId);
    data.append("rent", formData.rent);
    data.append("securityDeposit", formData.securityDeposit);
    data.append("description", formData.description);
    data.append("stock", formData.stock);
    data.append("image", formData.image);
  
    try {
      setLoading(true);
      await axios.post(
        "http://localhost:5001/api/product/add",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setLoading(false); 
      onClose(); // Close the form after success
    } catch (error) {
      // Log the entire error object
      console.error("Error adding product:", error);
  
      // If error.response exists, log response data
      if (error.response) {
        console.error("Error response data:", error.response.data);
      } else {
        // Handle cases where there's no response
        console.error("An unknown error occurred:", error.message);
      }
    }
  };

  return (
    <div className="bg-gray-900 p-6 rounded-md shadow-lg">
      <h2 className="text-lg font-medium mb-4">Add New Product</h2>
      {loading ? (  // Show loading spinner while loading
        <LoadingSpinner />
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-100">Product Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md text-black"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-100">Category</label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md text-black"
              required
            >
              <option value="" disabled>Select a category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-100">Rent</label>
            <input
              type="number"
              name="rent"
              value={formData.rent}
              onChange={handleChange}
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md text-black"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-100">Security Deposit</label>
            <input
              type="number"
              name="securityDeposit"
              value={formData.securityDeposit}
              onChange={handleChange}
              className="mt-1 p-2 block w-full border border-gray-300 text-black rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-100">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md text-black"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-100">Image</label>
            <input
              type="file"
              name="image"
              onChange={handleImageChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-100">Stock</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md text-black"
              required
            />
          </div>
          <div className="flex justify-end">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md">
              Add Product
            </button>
            <button
              type="button"
              className="ml-2 bg-gray-500 text-white px-4 py-2 rounded-md"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AddProductForm;
