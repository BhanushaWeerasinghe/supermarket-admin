import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");


  const fetchOrders = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        "http://localhost:5000/api/orders"
      );

      setOrders(response.data.orders || []);
      setError("");
    } catch (error) {
      console.error(error);
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(
        "http://localhost:5000/api/orders/" + id + "/status",
        {
          status,
        }
      );

      alert("Order status updated successfully!");
      fetchOrders();
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Failed to update order status"
      );
    }
  };

  const deleteOrder = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this order?\n\nThe stock used by this order will be restored."
    );

    if (!confirmed) {
      return;
    }

    try {
      await axios.delete(
        "http://localhost:5000/api/orders/" + id
      );

      alert("Order deleted successfully!");
      fetchOrders();
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Failed to delete order"
      );
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
  const searchText = search.toLowerCase();

  const matchesSearch =
    order.id?.toLowerCase().includes(searchText) ||
    order.customerName?.toLowerCase().includes(searchText) ||
    order.status?.toLowerCase().includes(searchText);

  const matchesStatus =
    statusFilter === "All" ||
    order.status === statusFilter;

  return matchesSearch && matchesStatus;
});

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-lg text-gray-600">
          Loading orders...
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Orders
          </h1>

          <p className="text-gray-500 mt-1">
            Manage customer orders
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/orders/create")}
          className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700"
        >
          + Create Order
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
          {error}
        </div>
      )}
      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          
          <input
            type="text"
            placeholder="Search by order ID, customer or status..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-lg px-4 py-3"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-4">
                  Order ID
                </th>

                <th className="text-left px-6 py-4">
                  Customer
                </th>

                <th className="text-left px-6 py-4">
                  Items
                </th>

                <th className="text-left px-6 py-4">
                  Total
                </th>

                <th className="text-left px-6 py-4">
                  Payment
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
              {filteredOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center py-10 text-gray-500"
                  >
                    No matching orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-t hover:bg-gray-50"
                  >
                    {/* Order ID */}
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm">
                        #{order.id.slice(0, 8)}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="px-6 py-4 font-medium">
                      {order.customerName ||
                        "Walk-in Customer"}
                    </td>

                    {/* Items */}
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {order.items?.map((item, index) => (
                          <div key={index}>
                            {item.productName} ×{" "}
                            {item.quantity}
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Total */}
                    <td className="px-6 py-4 font-semibold">
                      Rs. {order.total}
                    </td>

                    {/* Payment */}
                    <td className="px-6 py-4">
                      {order.paymentMethod}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          updateStatus(
                            order.id,
                            e.target.value
                          )
                        }
                        className="border rounded-lg px-3 py-2"
                      >
                        <option value="Pending">
                          Pending
                        </option>

                        <option value="Processing">
                          Processing
                        </option>

                        <option value="Completed">
                          Completed
                        </option>

                        <option value="Cancelled">
                          Cancelled
                        </option>
                      </select>
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/orders/${order.id}`)
                          }
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          View
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/orders/${order.id}/edit`)
                          }
                          className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            deleteOrder(order.id)
                          }
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

      {/* Footer */}
      <div className="mt-4 text-sm text-gray-500">
        Total Orders: {orders.length}
      </div>
    </div>
  );
};

export default Orders;