import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CreateOrder = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [customerId, setCustomerId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");

  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [productSearch, setProductSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const [productsResponse, customersResponse] =
        await Promise.all([
          axios.get("http://localhost:5000/api/inventory"),
          axios.get("http://localhost:5000/api/customers"),
        ]);

      setProducts(productsResponse.data.inventory || []);
      setCustomers(customersResponse.data.customers || []);
    } catch (error) {
      console.error(error);
      alert("Failed to load products or customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addToCart = (product) => {
    const existingItem = cart.find(
      (item) => item.productId === product.id
    );

    if (existingItem) {
      if (existingItem.quantity >= product.quantity) {
        alert("Not enough stock available");
        return;
      }

      setCart(
        cart.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal:
                  (item.quantity + 1) * item.price,
              }
            : item
        )
      );

      return;
    }

    setCart([
      ...cart,
      {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        price: Number(product.price),
        subtotal: Number(product.price),
        availableStock: Number(product.quantity),
      },
    ]);
  };

  const updateQuantity = (productId, quantity) => {
    const item = cart.find(
      (item) => item.productId === productId
    );

    if (!item) return;

    const newQuantity = Number(quantity);

    if (newQuantity < 1) {
      return;
    }

    if (newQuantity > item.availableStock) {
      alert("Not enough stock available");
      return;
    }

    setCart(
      cart.map((cartItem) =>
        cartItem.productId === productId
          ? {
              ...cartItem,
              quantity: newQuantity,
              subtotal:
                newQuantity * cartItem.price,
            }
          : cartItem
      )
    );
  };

  const removeFromCart = (productId) => {
    setCart(
      cart.filter(
        (item) => item.productId !== productId
      )
    );
  };

  const subtotal = cart.reduce(
    (total, item) => total + item.subtotal,
    0
  );

  const discountAmount = Number(discount || 0);

  const total = Math.max(
    subtotal - discountAmount,
    0
  );
  const filteredProducts = products.filter((product) => {
  const searchText = productSearch.toLowerCase().trim();

  return (
    product.name?.toLowerCase().includes(searchText) ||
    product.category?.toLowerCase().includes(searchText) ||
    product.barcode?.toLowerCase().includes(searchText)
  );
});

  const handleCreateOrder = async () => {
    if (cart.length === 0) {
      alert("Please add at least one product");
      return;
    }

    if (discountAmount > subtotal) {
      alert("Discount cannot be greater than subtotal");
      return;
    }

    const selectedCustomer = customers.find(
      (customer) => customer.id === customerId
    );

    try {
      setSaving(true);

      await axios.post(
        "http://localhost:5000/api/orders",
        {
          customerId: customerId || "",
          customerName:
            selectedCustomer?.name ||
            "Walk-in Customer",

          items: cart.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.subtotal,
          })),

          subtotal,
          discount: discountAmount,
          total,
          paymentMethod,
        }
      );

      alert("Order created successfully!");

      navigate("/orders");
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Failed to create order"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-lg text-gray-600">
          Loading...
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Create Order
        </h1>

        <p className="text-gray-500 mt-1">
          Create a new customer order
        </p>
      </div>

      {/* Customer and Payment */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
              className="w-full border rounded-lg p-3"
            >
              <option value="">
                Walk-in Customer
              </option>

              {customers.map((customer) => (
                <option
                  key={customer.id}
                  value={customer.id}
                >
                  {customer.name} - {customer.phone}
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
              className="w-full border rounded-lg p-3"
            >
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">
          Products
        </h2>
        <div className="mb-4">
          <input
            type="text"
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            placeholder="Search product by name, category or barcode..."
            className="w-full border rounded-lg p-3"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="border rounded-lg p-4"
            >
              <h3 className="font-semibold">
                {product.name}
              </h3>

              <p className="text-gray-500 text-sm mt-1">
                {product.category}
              </p>

              <p className="font-semibold mt-2">
                Rs. {product.price}
              </p>

              <p className="text-sm text-gray-500">
                Stock: {product.quantity}
              </p>

              <button
                type="button"
                onClick={() => addToCart(product)}
                disabled={Number(product.quantity) <= 0}
                className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                {Number(product.quantity) <= 0
                  ? "Out of Stock"
                  : "Add to Order"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Cart */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">
          Order Items
        </h2>

        {cart.length === 0 ? (
          <p className="text-gray-500">
            No products added yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3">
                    Product
                  </th>

                  <th className="text-left px-4 py-3">
                    Price
                  </th>

                  <th className="text-left px-4 py-3">
                    Quantity
                  </th>

                  <th className="text-left px-4 py-3">
                    Subtotal
                  </th>

                  <th className="text-left px-4 py-3">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {cart.map((item) => (
                  <tr
                    key={item.productId}
                    className="border-t"
                  >
                    <td className="px-4 py-3">
                      {item.productName}
                    </td>

                    <td className="px-4 py-3">
                      Rs. {item.price}
                    </td>

                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="1"
                        max={item.availableStock}
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(
                            item.productId,
                            e.target.value
                          )
                        }
                        className="w-20 border rounded p-2"
                      />
                    </td>

                    <td className="px-4 py-3 font-semibold">
                      Rs. {item.subtotal}
                    </td>

                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() =>
                          removeFromCart(
                            item.productId
                          )
                        }
                        className="px-3 py-1 bg-red-100 text-red-700 rounded"
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
      <div className="bg-white rounded-xl shadow p-6">
        <div className="max-w-md ml-auto space-y-4">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-semibold">
              Rs. {subtotal}
            </span>
          </div>

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
              className="w-full border rounded-lg p-3"
              placeholder="Enter discount"
            />
          </div>

          <div className="border-t pt-4 flex justify-between text-xl">
            <span className="font-bold">
              Total
            </span>

            <span className="font-bold text-blue-600">
              Rs. {total}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCreateOrder}
            disabled={saving || cart.length === 0}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
          >
            {saving
              ? "Creating Order..."
              : "Create Order"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/orders")}
            className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateOrder;