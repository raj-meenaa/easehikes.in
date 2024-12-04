import { useState } from "react";
import axios from "axios";

const AddCategoryForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    image: null,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const data = new FormData();
    data.append("name", formData.name);
    data.append("image", formData.image);

    try {
      await axios.post("http://localhost:5001/api/admin/addcategory", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      onClose();  // Close form after success
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  return (
    <div className="bg-gray-900 p-6 rounded-md shadow-lg">
      <h2 className="text-lg font-medium mb-4">Add New Category</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-100">Category Name</label>
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
          <label className="block text-sm font-medium text-gray-100">Image</label>
          <input type="file" name="image" onChange={handleImageChange} className="w-full px-3 py-2 border rounded" required />
        </div>
        <div className="flex justify-end">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md">
            Add Category
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
    </div>
  );
};

export default AddCategoryForm;
