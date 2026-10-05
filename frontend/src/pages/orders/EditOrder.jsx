import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const EditOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [order, setOrder] = useState(null);

  const [customerId, setCustomerId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [discount, setDiscount] = useState(0);
  const [items, setItems] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // Load Order, Customers and Products
  // =========================

  useEffect(() => {
    const loadData = async () => {
      try {
        const [orderResponse, customersResponse, productsResponse] =
          await Promise.all([
            axios.get(`http://localhost:5000/api/orders/${id}`),
            axios.get("http://localhost:5000/api/customers"),
            axios.get("http://localhost:5000/api/products"),
          ]);

        const loadedOrder = orderResponse.data.order;

        setOrder(loadedOrder);
        setCustomerId(loadedOrder.customerId || "");
        setPaymentMethod(
          loadedOrder.paymentMethod || "Cash"
        );
        setDiscount(Number(loadedOrder.discount || 0));

        setItems(
          (loadedOrder.items || []).map((item) => ({
            productId: item.productId,
            productName: item.productName,
            quantity: Number(item.quantity || 1),
            price: Number(item.price || 0),
            subtotal: Number(item.subtotal || 0),
          }))
        );

        setCustomers(
          customersResponse.data.customers || []
        );

        setProducts(
          productsResponse.data.products || []
        );
      } catch (error) {
        console.error(error);
        setError("Failed to load order data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  // =========================
  // Add Product
  // =========================

  const addProduct = (productId) => {
    if (!productId) return;

    const product = products.find(
      (item) => item.id === productId
    );

    if (!product) return;

    const existingItem = items.find(
      (item) => item.productId === productId
    );

    if (existingItem) {
      setItems(
        items.map((item) =>
          item.productId === productId
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal:
                  (item.quantity + 1) * item.price,
              }
            : item
        )
      );
    } else {
      setItems([
        ...items,
        {
          productId: product.id,
          productName: product.name,
          quantity: 1,
          price: Number(product.price || 0),
          subtotal: Number(product.price || 0),
        },
      ]);
    }
  };

  // =========================
  // Change Quantity
  // =========================

  const updateQuantity = (productId, quantity) => {
    const newQuantity = Math.max(
      1,
      Number(quantity || 1)
    );

    setItems(
      items.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity: newQuantity,
              subtotal:
                newQuantity * Number(item.price || 0),
            }
          : item
      )
    );
  };

  // =========================
  // Remove Product
  // =========================

  const removeItem = (productId) => {
    setItems(
      items.filter(
        (item) => item.productId !== productId
      )
    );
  };

  // =========================
  // Calculate Totals
  // =========================

  const subtotal = items.reduce(
    (sum, item) =>
      sum +
      Number(item.price || 0) *
        Number(item.quantity || 0),
    0
  );

  const discountAmount = Math.max(
    0,
    Number(discount || 0)
  );

  const total = Math.max(
    0,
    subtotal - discountAmount
  );

  // =========================
  // Update Order
  // =========================

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (items.length === 0) {
      alert("Please add at least one product.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const selectedCustomer = customers.find(
        (customer) => customer.id === customerId
      );

      const updatedItems = items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: Number(item.quantity),
        price: Number(item.price),
        subtotal:
          Number(item.price) *
          Number(item.quantity),
      }));

      await axios.put(
        `http://localhost:5000/api/orders/${id}`,
        {
          customerId: customerId || "",
          customerName:
            selectedCustomer?.name ||
            order?.customerName ||
            "Walk-in Customer",
          items: updatedItems,
          subtotal,
          discount: discountAmount,
          total,
          paymentMethod,
        }
      );

      alert("Order updated successfully!");

      navigate(`/orders/${id}`);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to update order"
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // Loading
  // =========================

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-lg text-gray-600">
          Loading order...
        </p>
      </div>
    );
  }

  // =========================
  // Error
  // =========================

  if (error && !order) {
    return (
      <div>
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">
          {error}
        </div>

        <button
          type="button"
          onClick={() => navigate("/orders")}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Edit Order
          </h1>

          <p className="text-gray-500 mt-1">
            Order #{id.slice(0, 8)}
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate(`/orders/${id}`)
          }
          className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-300"
        >
          ← Back
        </button>
      </div>

      {/* Error */}

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleUpdate}>
        {/* Customer and Payment */}

        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">
            Order Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Customer */}

            <div>
              <label className="block text-sm font-medium mb-2">
                Customer
              </label>

              <select
                value={customerId}
                onChange={(e) =>
                  setCustomerId(e.target.value)
                }
                className="w-full border rounded-lg px-4 py-3"
              >
                <option value="">
                  Walk-in Customer
                </option>

                {customers.map((customer) => (
                  <option
                    key={customer.id}
                    value={customer.id}
                  >
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment */}

            <div>
              <label className="block text-sm font-medium mb-2">
                Payment Method
              </label>

              <select
                value={paymentMethod}
                onChange={(e) =>
                  setPaymentMethod(e.target.value)
                }
                className="w-full border rounded-lg px-4 py-3"
              >
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="Bank Transfer">
                  Bank Transfer
                </option>
              </select>
            </div>

            {/* Discount */}

            <div>
              <label className="block text-sm font-medium mb-2">
                Discount
              </label>

              <input
                type="number"
                min="0"
                value={discount}
                onChange={(e) =>
                  setDiscount(e.target.value)
                }
                className="w-full border rounded-lg px-4 py-3"
              />
            </div>
          </div>
        </div>

        {/* Add Product */}

        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">
            Add Product
          </h2>

          <select
            value=""
            onChange={(e) =>
              addProduct(e.target.value)
            }
            className="w-full border rounded-lg px-4 py-3"
          >
            <option value="">
              Select a product
            </option>

            {products.map((product) => (
              <option
                key={product.id}
                value={product.id}
              >
                {product.name} - Rs.{" "}
                {product.price}
              </option>
            ))}
          </select>
        </div>

        {/* Products */}

        <div className="bg-white rounded-xl shadow overflow-hidden mb-6">
          <div className="p-6">
            <h2 className="text-lg font-bold">
              Order Items
            </h2>
          </div>

          {items.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No products added.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-6 py-4">
                      Product
                    </th>

                    <th className="text-left px-6 py-4">
                      Price
                    </th>

                    <th className="text-left px-6 py-4">
                      Quantity
                    </th>

                    <th className="text-left px-6 py-4">
                      Subtotal
                    </th>

                    <th className="text-left px-6 py-4">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((item) => (
                    <tr
                      key={item.productId}
                      className="border-t"
                    >
                      <td className="px-6 py-4 font-medium">
                        {item.productName}
                      </td>

                      <td className="px-6 py-4">
                        Rs.{" "}
                        {Number(
                          item.price
                        ).toLocaleString()}
                      </td>

                      <td className="px-6 py-4">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            updateQuantity(
                              item.productId,
                              e.target.value
                            )
                          }
                          className="w-24 border rounded-lg px-3 py-2"
                        />
                      </td>

                      <td className="px-6 py-4 font-semibold">
                        Rs.{" "}
                        {Number(
                          item.price *
                            item.quantity
                        ).toLocaleString()}
                      </td>

                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() =>
                            removeItem(
                              item.productId
                            )
                          }
                          className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary */}

        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="max-w-sm ml-auto space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">
                Subtotal
              </span>

              <span className="font-medium">
                Rs.{" "}
                {subtotal.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">
                Discount
              </span>

              <span className="font-medium">
                Rs.{" "}
                {discountAmount.toLocaleString()}
              </span>
            </div>

            <div className="border-t pt-3 flex justify-between text-xl">
              <span className="font-bold">
                Total
              </span>

              <span className="font-bold">
                Rs.{" "}
                {total.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Buttons */}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() =>
              navigate(`/orders/${id}`)
            }
            className="px-5 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving
              ? "Updating..."
              : "Update Order"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditOrder;