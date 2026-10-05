import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Categories = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCategories = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        "http://localhost:5000/api/categories"
      );

      setCategories(response.data.categories);
      setError("");
    } catch (error) {
      console.error(error);
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async (id) => {
  const confirmed = window.confirm(
    "Are you sure you want to delete this category?"
  );

  if (!confirmed) return;

  try {
    await axios.delete(
      `http://localhost:5000/api/categories/${id}`
    );

    alert("Category deleted successfully!");

    fetchCategories();
  } catch (error) {
    console.error(error);

    alert(
      error.response?.data?.message ||
        "Failed to delete category"
    );
  }
};

  useEffect(() => {
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-lg text-gray-600">
          Loading categories...
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Categories
          </h1>

          <p className="text-gray-500 mt-1">
            Manage product categories
          </p>
        </div>

        <button
          onClick={() => navigate("/categories/add")}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700"
        >
          + Add Category
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Categories Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-4">
                Category Name
              </th>

              <th className="text-left px-6 py-4">
                Description
              </th>

              <th className="text-left px-6 py-4">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td
                  colSpan="3"
                  className="text-center py-10 text-gray-500"
                >
                  No categories found
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr
                  key={category.id}
                  className="border-t hover:bg-gray-50"
                >
                  <td className="px-6 py-4 font-medium">
                    {category.name}
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {category.description || "-"}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/categories/edit/${category.id}`)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(category.id)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        Total Categories: {categories.length}
      </div>
    </div>
  );
};

export default Categories;