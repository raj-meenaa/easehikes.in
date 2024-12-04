import { useState } from "react";
import axios from "axios";

const EditCategoryForm = ({ category, onClose, onUpdate }) => {
  const [name, setName] = useState(category.name);
  const [image, setImage] = useState(category.image);

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5001/api/admin/updatecategory/${category._id}`,
        { name, image },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      onUpdate(); // Call this to refresh the list
      onClose(); // Close the edit form after updating
    } catch (error) {
      console.error("Error updating category:", error);
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-md shadow-md">
      <h3 className="text-lg font-semibold text-gray-100 mb-4">Edit Category</h3>
      <input
        type="text"
        className="mb-3 w-full p-2 rounded-md text-gray-700"
        placeholder="Category Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="text"
        className="mb-3 w-full p-2 rounded-md text-gray-700"
        placeholder="Image URL"
        value={image}
        onChange={(e) => setImage(e.target.value)}
      />
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded-md"
        onClick={handleUpdate}
      >
        Update Category
      </button>
      <button
        className="text-gray-400 hover:text-gray-200 ml-4"
        onClick={onClose}
      >
        Cancel
      </button>
    </div>
  );
};

export default EditCategoryForm;
