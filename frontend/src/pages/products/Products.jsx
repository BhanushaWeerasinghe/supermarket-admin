import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Products = () => {
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        "http://localhost:5000/api/products"
      );

      setProducts(response.data.products);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };
    // ADD handleDelete HERE
    const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await axios.delete(
        `http://localhost:5000/api/products/${id}`
      );

      alert("Product deleted successfully!");

      fetchProducts();
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Failed to delete product"
      );
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);
  const filteredProducts = products.filter((product) => {
  const searchText = search.toLowerCase().trim();

  return (
    product.name?.toLowerCase().includes(searchText) ||
    product.category?.toLowerCase().includes(searchText) ||
    product.barcode?.toLowerCase().includes(searchText)
  );
});

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-lg text-gray-600">Loading products...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Products
          </h1>

          <p className="text-gray-500 mt-1">
            Manage your supermarket products
          </p>
        </div>

        <button
          onClick={() => navigate("/products/add")}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700"
        >
          + Add Product
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-xl shadow p-4 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search product by name, category or barcode..."
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold">
                  Product
                </th>

                <th className="text-left px-6 py-4 text-sm font-semibold">
                  Category
                </th>

                <th className="text-left px-6 py-4 text-sm font-semibold">
                  Price
                </th>

                <th className="text-left px-6 py-4 text-sm font-semibold">
                  Quantity
                </th>

                <th className="text-left px-6 py-4 text-sm font-semibold">
                  Barcode
                </th>

                <th className="text-left px-6 py-4 text-sm font-semibold">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-10 text-gray-500"
                  >
                    No products found
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="border-t hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800">
                        {product.name}
                      </div>

                      {product.description && (
                        <div className="text-sm text-gray-500">
                          {product.description}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {product.category}
                    </td>

                    <td className="px-6 py-4 font-medium">
                      Rs. {product.price}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          product.quantity > 10
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {product.quantity}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {product.barcode || "-"}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/products/edit/${product.id}`)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(product.id)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
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
      </div>

      {/* Product Count */}
      <div className="mt-4 text-sm text-gray-500">
      Showing {filteredProducts.length} of {products.length} products
    </div>
    </div>
  );
};

export default Products;