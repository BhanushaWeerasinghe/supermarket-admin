import { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
} from "lucide-react";

const Reports = () => {
  const [report, setReport] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const filteredOrders =
    fromDate && toDate && fromDate > toDate
      ? []
      : (report?.recentOrders || []).filter((order) => {
          const orderDate = new Date(
            order.createdAt?._seconds * 1000
          );

          const orderDateOnly = orderDate
            .toISOString()
            .split("T")[0];

          if (fromDate && orderDateOnly < fromDate) {
            return false;
          }

          if (toDate && orderDateOnly > toDate) {
            return false;
          }

          return true;
        });

  const filteredSales = filteredOrders.reduce(
    (total, order) => total + Number(order.total || 0),
    0
  );

  const averageOrderValue =
    filteredOrders.length > 0
      ? filteredSales / filteredOrders.length
      : 0;

  const totalDiscount = filteredOrders.reduce(
    (total, order) => total + Number(order.discount || 0),
    0
  );

  const productSales = {};

  filteredOrders.forEach((order) => {
    order.items?.forEach((item) => {
      if (!productSales[item.productId]) {
        productSales[item.productId] = {
          name: item.productName,
          quantity: 0,
          revenue: 0,
        };
      }

      productSales[item.productId].quantity += Number(
        item.quantity || 0
      );

      productSales[item.productId].revenue += Number(
        item.subtotal || 0
      );
    });
  });

  const productSalesList = Object.values(productSales);
  const exportToExcel = () => {
  const salesData = filteredOrders.map((order) => ({
    "Order ID": order.id,
    Customer: order.customerName || "Walk-in Customer",
    Date: new Date(order.createdAt?._seconds * 1000).toLocaleDateString(),
    "Payment Method": order.paymentMethod || "Unknown",
    Status: order.status || "Pending",
    Total: Number(order.total || 0),
  }));

  const worksheet = XLSX.utils.json_to_sheet(salesData);

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Sales Report"
  );

  XLSX.writeFile(workbook, "Sales_Report.xlsx");
};
  const paymentSales = {};

  filteredOrders.forEach((order) => {
    const paymentMethod = order.paymentMethod || "Unknown";

    if (!paymentSales[paymentMethod]) {
      paymentSales[paymentMethod] = 0;
    }

    paymentSales[paymentMethod] += Number(order.total || 0);
  });

  const paymentSalesList = Object.entries(paymentSales).map(
    ([method, amount]) => ({
      method,
      amount,
    })
  );
  const orderStatus = {};

  filteredOrders.forEach((order) => {
    const status = order.status || "Pending";

    if (!orderStatus[status]) {
      orderStatus[status] = 0;
    }

    orderStatus[status] += 1;
  });

  const orderStatusList = Object.entries(orderStatus).map(
    ([status, count]) => ({
      status,
      count,
    })
  );

useEffect(() => {
  const fetchReport = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/dashboard"
      );

      setReport(response.data);

      const customerResponse = await axios.get(
        "http://localhost:5000/api/customers"
      );

      setCustomers(customerResponse.data.customers || []);
      const inventoryResponse = await axios.get(
        "http://localhost:5000/api/inventory"
      );

      setInventory(inventoryResponse.data.inventory || []);
    } catch (error) {
      console.error("Failed to load report:", error);
    }
  };

  fetchReport();
}, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800">
        Reports
      </h1>

      <p className="text-gray-500 mt-1">
        View and analyze your supermarket reports
      </p>
      <button
        onClick={() => window.print()}
        className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
      >
        Print Report
      </button>
      <button
        onClick={exportToExcel}
        className="mt-4 ml-3 bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700"
      >
        Export Excel
      </button>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">

        {/* Total Sales */}
        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-green-500">
          <p className="text-gray-500 text-sm">
            Total Sales
          </p>

          <h2 className="text-2xl font-bold text-gray-800 mt-2">
            Rs. {report?.stats?.totalSales || 0}
          </h2>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-blue-500">
          <p className="text-gray-500 text-sm">
            Total Orders
          </p>

          <h2 className="text-2xl font-bold text-gray-800 mt-2">
            {report?.stats?.totalOrders || 0}
          </h2>
        </div>

        {/* Total Products */}
        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-purple-500">
          <p className="text-gray-500 text-sm">
            Total Products
          </p>

          <h2 className="text-2xl font-bold text-gray-800 mt-2">
            {report?.stats?.totalProducts || 0}
          </h2>
        </div>

        {/* Total Customers */}
        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-orange-500">
          <p className="text-gray-500 text-sm">
            Total Customers
          </p>

          <h2 className="text-2xl font-bold text-gray-800 mt-2">
            {report?.stats?.totalCustomers || 0}
          </h2>
        </div>

      </div>

      {/* Sales Report */}
      <div className="bg-white rounded-xl shadow p-6 mt-6">
        <h2 className="text-xl font-bold text-gray-800">
          Sales Report
        </h2>

        <p className="text-gray-500 mt-1">
          View sales information and order details
        </p>

        {/* Sales Summary */}
        <div className="bg-blue-50 rounded-lg p-4 mt-4">
          <p className="text-sm text-gray-600">
            Sales for selected period
          </p>

          <p className="text-2xl font-bold text-blue-700 mt-1">
            Rs. {filteredSales}
          </p>
        </div>

        <div className="bg-green-50 rounded-lg p-4 mt-4">
          <p className="text-sm text-gray-600">
            Orders in selected period
          </p>

          <p className="text-2xl font-bold text-green-700 mt-1">
            {filteredOrders.length}
          </p>
        </div>

        <div className="bg-purple-50 rounded-lg p-4 mt-4">
          <p className="text-sm text-gray-600">
            Average Order Value
          </p>

          <p className="text-2xl font-bold text-purple-700 mt-1">
            Rs. {averageOrderValue.toFixed(2)}
          </p>
        </div>

        <div className="bg-orange-50 rounded-lg p-4 mt-4">
          <p className="text-sm text-gray-600">
            Total Discount
          </p>

          <p className="text-2xl font-bold text-orange-700 mt-1">
            Rs. {totalDiscount}
          </p>
        </div>

        {/* Date Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Date
            </label>

            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To Date
            </label>

            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3"
            />
          </div>

          <div className="md:col-span-2">
            <button
              onClick={() => {
                setFromDate("");
                setToDate("");
              }}
              className="bg-gray-600 text-white px-5 py-2 rounded-lg hover:bg-gray-700"
            >
              Clear Filters
            </button>
          </div>

        </div>

        {/* Invalid Date Message */}
        {fromDate && toDate && fromDate > toDate && (
          <p className="text-red-600 text-sm mt-3">
            From Date cannot be later than To Date.
          </p>
        )}

        {/* Orders Table */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3">
                  Order ID
                </th>

                <th className="text-left px-4 py-3">
                  Customer
                </th>

                <th className="text-left px-4 py-3">
                  Total
                </th>

                <th className="text-left px-4 py-3">
                  Payment
                </th>

                <th className="text-left px-4 py-3">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-6 text-gray-500"
                  >
                    No orders found for the selected date range.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-t"
                  >
                    <td className="px-4 py-3">
                      {order.id}
                    </td>

                    <td className="px-4 py-3">
                      {order.customerName}
                    </td>

                    <td className="px-4 py-3">
                      Rs. {order.total}
                    </td>

                    <td className="px-4 py-3">
                      {order.paymentMethod}
                    </td>

                    <td className="px-4 py-3">
                      {order.status || "Pending"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Sales Report */}
      <div className="bg-white rounded-xl shadow p-6 mt-6">
        <h2 className="text-xl font-bold text-gray-800">
          Product Sales Report
        </h2>

        <p className="text-gray-500 mt-1">
          Products sold during the selected period
        </p>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3">
                  Product
                </th>

                <th className="text-left px-4 py-3">
                  Quantity Sold
                </th>

                <th className="text-left px-4 py-3">
                  Revenue
                </th>
              </tr>
            </thead>

            <tbody>
              {productSalesList.length === 0 ? (
                <tr>
                  <td
                    colSpan="3"
                    className="text-center py-6 text-gray-500"
                  >
                    No product sales found.
                  </td>
                </tr>
              ) : (
                productSalesList.map((product) => (
                  <tr
                    key={product.name}
                    className="border-t"
                  >
                    <td className="px-4 py-3">
                      {product.name}
                    </td>

                    <td className="px-4 py-3">
                      {product.quantity}
                    </td>

                    <td className="px-4 py-3">
                      Rs. {product.revenue}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Method Report */}
      <div className="bg-white rounded-xl shadow p-6 mt-6">
        <h2 className="text-xl font-bold text-gray-800">
          Payment Method Report
        </h2>

        <p className="text-gray-500 mt-1">
          Sales by payment method for the selected period
        </p>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3">
                  Payment Method
                </th>

                <th className="text-left px-4 py-3">
                  Sales Amount
                </th>
              </tr>
            </thead>

            <tbody>
              {paymentSalesList.length === 0 ? (
                <tr>
                  <td
                    colSpan="2"
                    className="text-center py-6 text-gray-500"
                  >
                    No payment data found.
                  </td>
                </tr>
              ) : (
                paymentSalesList.map((payment) => (
                  <tr
                    key={payment.method}
                    className="border-t"
                  >
                    <td className="px-4 py-3">
                      {payment.method}
                    </td>

                    <td className="px-4 py-3">
                      Rs. {payment.amount}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Inventory Report */}
      <div className="bg-white rounded-xl shadow p-6 mt-6">
        <h2 className="text-xl font-bold text-gray-800">
          Inventory Report
        </h2>

        <p className="text-gray-500 mt-1">
          Current stock and inventory value
        </p>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3">
                  Product
                </th>

                <th className="text-left px-4 py-3">
                  Category
                </th>

                <th className="text-left px-4 py-3">
                  Stock
                </th>

                <th className="text-left px-4 py-3">
                  Price
                </th>

                <th className="text-left px-4 py-3">
                  Stock Value
                </th>

                <th className="text-left px-4 py-3">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {inventory.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-6 text-gray-500"
                  >
                    No inventory data found.
                  </td>
                </tr>
              ) : (
                inventory.map((product) => {
                  const stock = Number(product.quantity || 0);
                  const price = Number(product.price || 0);
                  const stockValue = stock * price;

                  return (
                    <tr
                      key={product.id}
                      className="border-t"
                    >
                      <td className="px-4 py-3">
                        {product.name}
                      </td>

                      <td className="px-4 py-3">
                        {product.category}
                      </td>

                      <td className="px-4 py-3">
                        {stock}
                      </td>

                      <td className="px-4 py-3">
                        Rs. {price}
                      </td>

                      <td className="px-4 py-3">
                        Rs. {stockValue}
                      </td>

                      <td className="px-4 py-3">
                      {stock === 0 ? (
                        <span className="text-red-600 font-medium">
                          Out of Stock
                        </span>
                      ) : stock <= 10 ? (
                        <span className="text-orange-600 font-medium">
                          Low Stock
                        </span>
                      ) : (
                        <span className="text-green-600 font-medium">
                          In Stock
                        </span>
                      )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Customer Report */}
      <div className="bg-white rounded-xl shadow p-6 mt-6">
        <h2 className="text-xl font-bold text-gray-800">
          Customer Report
        </h2>

        <p className="text-gray-500 mt-1">
          Customer orders and spending information
        </p>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3">
                  Customer
                </th>

                <th className="text-left px-4 py-3">
                  Phone
                </th>

                <th className="text-left px-4 py-3">
                  Orders
                </th>

                <th className="text-left px-4 py-3">
                  Total Spent
                </th>
              </tr>
            </thead>

            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="text-center py-6 text-gray-500"
                  >
                    No customers found.
                  </td>
                </tr>
              ) : (
                customers.map((customer) => {
                  const customerOrders = filteredOrders.filter(
                    (order) => order.customerId === customer.id
                  );

                  const totalSpent = customerOrders.reduce(
                    (total, order) =>
                      total + Number(order.total || 0),
                    0
                  );

                  return (
                    <tr
                      key={customer.id}
                      className="border-t"
                    >
                      <td className="px-4 py-3">
                        {customer.name}
                      </td>

                      <td className="px-4 py-3">
                        {customer.phone}
                      </td>

                      <td className="px-4 py-3">
                        {customerOrders.length}
                      </td>

                      <td className="px-4 py-3">
                        Rs. {totalSpent}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Order Status Report */}
      <div className="bg-white rounded-xl shadow p-6 mt-6">
        <h2 className="text-xl font-bold text-gray-800">
          Order Status Report
        </h2>

        <p className="text-gray-500 mt-1">
          Number of orders by status
        </p>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3">
                  Status
                </th>

                <th className="text-left px-4 py-3">
                  Number of Orders
                </th>
              </tr>
            </thead>

            <tbody>
              {orderStatusList.length === 0 ? (
                <tr>
                  <td
                    colSpan="2"
                    className="text-center py-6 text-gray-500"
                  >
                    No order status data found.
                  </td>
                </tr>
              ) : (
                orderStatusList.map((item) => (
                  <tr
                    key={item.status}
                    className="border-t"
                  >
                    <td className="px-4 py-3">
                      {item.status}
                    </td>

                    <td className="px-4 py-3">
                      {item.count}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    
  );
};

export default Reports;