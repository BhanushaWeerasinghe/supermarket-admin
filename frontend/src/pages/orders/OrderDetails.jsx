import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/orders/${id}`
        );

        setOrder(response.data.order);
      } catch (error) {
        console.error(error);
        setError("Failed to load order");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-lg text-gray-600">
          Loading order...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">
          {error}
        </div>

        <button
          onClick={() => navigate("/orders")}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">
          Order not found
        </p>
      </div>
    );
  }

  const orderDate = order.createdAt?._seconds
    ? new Date(
        order.createdAt._seconds * 1000
      ).toLocaleString()
    : "N/A";

  let statusClass =
    "bg-gray-100 text-gray-700";

  if (order.status === "Pending") {
    statusClass =
      "bg-yellow-100 text-yellow-700";
  }

  if (order.status === "Processing") {
    statusClass =
      "bg-blue-100 text-blue-700";
  }

  if (order.status === "Completed") {
    statusClass =
      "bg-green-100 text-green-700";
  }

  if (order.status === "Cancelled") {
    statusClass =
      "bg-red-100 text-red-700";
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Order Details
          </h1>

          <p className="text-gray-500 mt-1">
            Order #{order.id.slice(0, 8)}
          </p>
        </div>

        <button
          onClick={() => navigate("/orders")}
          className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-300"
        >
          ← Back to Orders
        </button>
      </div>

      {/* Order Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Customer */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-bold mb-4">
            Customer Information
          </h2>

          <p className="text-gray-600">
            <span className="font-medium text-gray-800">
              Customer:
            </span>{" "}
            {order.customerName || "Walk-in Customer"}
          </p>

          <p className="text-gray-600 mt-2">
            <span className="font-medium text-gray-800">
              Customer ID:
            </span>{" "}
            {order.customerId || "N/A"}
          </p>
        </div>

        {/* Order Info */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-bold mb-4">
            Order Information
          </h2>

          <p className="text-gray-600">
            <span className="font-medium text-gray-800">
              Order ID:
            </span>{" "}
            #{order.id}
          </p>

          <p className="text-gray-600 mt-2">
            <span className="font-medium text-gray-800">
              Date:
            </span>{" "}
            {orderDate}
          </p>

          <p className="text-gray-600 mt-2">
            <span className="font-medium text-gray-800">
              Payment:
            </span>{" "}
            {order.paymentMethod}
          </p>

          <p className="mt-3">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${statusClass}`}
            >
              {order.status}
            </span>
          </p>
        </div>
      </div>

      {/* Products */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-bold">
            Order Items
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-4">
                  Product
                </th>

                <th className="text-left px-6 py-4">
                  Quantity
                </th>

                <th className="text-left px-6 py-4">
                  Price
                </th>

                <th className="text-left px-6 py-4">
                  Subtotal
                </th>
              </tr>
            </thead>

            <tbody>
              {order.items?.map((item, index) => (
                <tr
                  key={index}
                  className="border-t"
                >
                  <td className="px-6 py-4 font-medium">
                    {item.productName}
                  </td>

                  <td className="px-6 py-4">
                    {item.quantity}
                  </td>

                  <td className="px-6 py-4">
                    Rs.{" "}
                    {Number(
                      item.price || 0
                    ).toLocaleString()}
                  </td>

                  <td className="px-6 py-4 font-semibold">
                    Rs.{" "}
                    {Number(
                      item.subtotal || 0
                    ).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="border-t p-6">
          <div className="max-w-sm ml-auto space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">
                Subtotal
              </span>

              <span className="font-medium">
                Rs.{" "}
                {Number(
                  order.subtotal || 0
                ).toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">
                Discount
              </span>

              <span className="font-medium">
                Rs.{" "}
                {Number(
                  order.discount || 0
                ).toLocaleString()}
              </span>
            </div>

            <div className="border-t pt-3 flex justify-between text-lg">
              <span className="font-bold">
                Total
              </span>

              <span className="font-bold">
                Rs.{" "}
                {Number(
                  order.total || 0
                ).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;