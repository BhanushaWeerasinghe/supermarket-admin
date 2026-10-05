
import { useEffect, useState } from "react";
import axios from "axios";

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchInventory = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        "http://localhost:5000/api/inventory"
      );

      setInventory(response.data.inventory || []);
      setError("");
    } catch (error) {
      console.error(error);
      setError("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  const handleStockUpdate = async (id, currentQuantity) => {
    const newQuantity = window.prompt(
      "Enter new stock quantity:",
      String(currentQuantity)
    );

    if (newQuantity === null) {
      return;
    }

    const quantity = Number(newQuantity);

    if (isNaN(quantity) || quantity < 0) {
      alert("Please enter a valid quantity");
      return;
    }

    try {
      const url =
        "http://localhost:5000/api/inventory/" + id;

      await axios.put(url, {
        quantity: quantity,
      });

      alert("Stock updated successfully!");

      fetchInventory();
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Failed to update stock"
      );
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-lg text-gray-600">
          Loading inventory...
        </p>
      </div>
    );
  }

  const lowStockCount = inventory.filter((product) => {
    const quantity = Number(product.quantity || 0);

    return quantity > 0 && quantity <= 10;
  }).length;

  const outOfStockCount = inventory.filter((product) => {
    const quantity = Number(product.quantity || 0);

    return quantity === 0;
  }).length;

  return (
    <div>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Inventory
        </h1>

        <p className="text-gray-500 mt-1">
          Manage product stock levels
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">

        {/* Total Products */}
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">
            Total Products
          </p>

          <h2 className="text-3xl font-bold text-gray-800 mt-2">
            {inventory.length}
          </h2>

          <p className="text-sm text-gray-400 mt-1">
            Products in inventory
          </p>
        </div>

        {/* Low Stock */}
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">
            Low Stock
          </p>

          <h2 className="text-3xl font-bold text-yellow-600 mt-2">
            {lowStockCount}
          </h2>

          <p className="text-sm text-gray-400 mt-1">
            1 - 10 items remaining
          </p>
        </div>

        {/* Out of Stock */}
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">
            Out of Stock
          </p>

          <h2 className="text-3xl font-bold text-red-600 mt-2">
            {outOfStockCount}
          </h2>

          <p className="text-sm text-gray-400 mt-1">
            Products unavailable
          </p>
        </div>

      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-gray-50">
              <tr>

                <th className="text-left px-6 py-4">
                  Product
                </th>

                <th className="text-left px-6 py-4">
                  Category
                </th>

                <th className="text-left px-6 py-4">
                  Price
                </th>

                <th className="text-left px-6 py-4">
                  Stock
                </th>

                <th className="text-left px-6 py-4">
                  Status
                </th>

                <th className="text-left px-6 py-4">
                  Action
                </th>

              </tr>
            </thead>

            <tbody>

              {inventory.length === 0 ? (

                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-10 text-gray-500"
                  >
                    No inventory items found
                  </td>
                </tr>

              ) : (

                inventory.map((product) => {

                  const quantity = Number(
                    product.quantity || 0
                  );

                  return (
                    <tr
                      key={product.id}
                      className="border-t hover:bg-gray-50"
                    >

                      <td className="px-6 py-4 font-medium">
                        {product.name}
                      </td>

                      <td className="px-6 py-4">
                        {product.category || "-"}
                      </td>

                      <td className="px-6 py-4">
                        Rs. {product.price}
                      </td>

                      <td className="px-6 py-4 font-semibold">
                        {quantity}
                      </td>

                      <td className="px-6 py-4">

                        {quantity === 0 ? (

                          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                            Out of Stock
                          </span>

                        ) : quantity <= 10 ? (

                          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                            Low Stock
                          </span>

                        ) : (

                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                            In Stock
                          </span>

                        )}

                      </td>

                      <td className="px-6 py-4">

                        <button
                          type="button"
                          onClick={() =>
                            handleStockUpdate(
                              product.id,
                              quantity
                            )
                          }
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          Update Stock
                        </button>

                      </td>

                    </tr>
                  );
                })

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* Footer */}
      <div className="mt-4 text-sm text-gray-500">
        Total Products: {inventory.length}
      </div>

    </div>
  );
};

export default Inventory;

