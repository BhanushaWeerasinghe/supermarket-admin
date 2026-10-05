import { useEffect, useState } from "react";
import axios from "axios";


import {
  ShoppingCart,
  Package,
  Users,
  DollarSign,
  AlertTriangle,
} from "lucide-react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";

const Dashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

useEffect(() => {
  const fetchDashboard = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/dashboard"
      );

      setDashboard(response.data);
    } catch (error) {
      console.error("Dashboard error:", error);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Load dashboard immediately
  fetchDashboard();

  // Refresh every 30 seconds
  const interval = setInterval(() => {
    fetchDashboard();
  }, 30000);

  // Cleanup interval when leaving dashboard
  return () => clearInterval(interval);
}, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 text-lg">
          Loading dashboard...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  const stats = [
    {
      title: "Total Sales",
      value: `Rs. ${dashboard?.stats?.totalSales?.toLocaleString() || 0}`,
      icon: DollarSign,
    },
    {
      title: "Products",
      value: dashboard?.stats?.totalProducts || 0,
      icon: Package,
    },
    {
      title: "Orders",
      value: dashboard?.stats?.totalOrders || 0,
      icon: ShoppingCart,
    },
    {
      title: "Customers",
      value: dashboard?.stats?.totalCustomers || 0,
      icon: Users,
    },
  ];

  const lowStockProducts = dashboard?.lowStockProducts || [];
  const recentOrders = dashboard?.recentOrders || [];

  return (
    <div>
      {/* Page Title */}
      <h1 className="text-3xl font-bold mb-6">
        Dashboard
      </h1>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="bg-white rounded-xl shadow p-6 flex items-center justify-between"
            >
              <div>
                <p className="text-gray-500">
                  {item.title}
                </p>

                <h2 className="text-3xl font-bold mt-2">
                  {item.value}
                </h2>
              </div>

              <div className="bg-blue-100 p-3 rounded-full">
                <Icon
                  className="text-blue-600"
                  size={30}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">

        {/* Sales Overview */}
{/* Sales Overview */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-4">
            Sales Overview
          </h2>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboard?.monthlySales || []}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="month" />

                <YAxis />

                <Tooltip
                  formatter={(value) =>
                    `Rs. ${Number(value).toLocaleString()}`
                  }
                />

                <Line
                  type="monotone"
                  dataKey="sales"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Inventory Summary */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-4">
            Inventory
          </h2>

          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-500">
                Total Products
              </span>

              <span className="font-bold">
                {dashboard?.stats?.totalProducts || 0}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">
                Total Stock
              </span>

              <span className="font-bold">
                {dashboard?.stats?.totalInventory || 0}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">
                Low Stock
              </span>

              <span className="font-bold text-red-500">
                {lowStockProducts.length}
              </span>
            </div>
          </div>
        </div>
        {/* Top Selling Products */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-4">
            Top Selling Products
          </h2>

          <div className="h-64">
            {dashboard?.topProducts?.length === 0 ? (
              <p className="text-gray-500">
                No sales data available.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboard?.topProducts || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip />
                    <Bar
                      dataKey="quantity"
                      name="Sold Quantity"
                    >
                      {dashboard?.topProducts?.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            [
                              "#3B82F6",
                              "#22C55E",
                              "#F59E0B",
                              "#EF4444",
                              "#8B5CF6",
                            ][index]
                          }
                        />
                      ))}
                    </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Low Stock */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="text-red-500" />

            <h2 className="text-xl font-bold">
              Low Stock
            </h2>
          </div>

          {lowStockProducts.length === 0 ? (
            <p className="text-gray-500">
              No low-stock products.
            </p>
          ) : (
            <ul className="space-y-3">
              {lowStockProducts.map((product) => (
                <li
                  key={product.id}
                  className="flex justify-between items-center"
                >
                  <span>
                    {product.name}
                  </span>

                  <span className="text-red-500 font-semibold">
                    {product.quantity} left
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

{/* Recent Orders */}
    <div className="lg:col-span-2 bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-bold mb-4">
        Recent Orders
      </h2>

      {recentOrders.length === 0 ? (
        <p className="text-gray-500">
          No orders available.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left">
                <th className="py-3 px-2">
                  Order
                </th>

                <th className="py-3 px-2">
                  Customer
                </th>

                <th className="py-3 px-2">
                  Total
                </th>

                <th className="py-3 px-2">
                  Payment
                </th>

                <th className="py-3 px-2">
                  Status
                </th>

                <th className="py-3 px-2">
                  Date
                </th>
              </tr>
            </thead>

            <tbody>
              {recentOrders.map((order) => {
                let statusClass =
                  "bg-gray-100 text-gray-700";

                if (order.status === "Pending") {
                  statusClass =
                    "bg-yellow-100 text-yellow-700";
                }

                if (order.status === "Completed") {
                  statusClass =
                    "bg-green-100 text-green-700";
                }

                if (order.status === "Cancelled") {
                  statusClass =
                    "bg-red-100 text-red-700";
                }

                let orderDate = "N/A";

                if (order.createdAt?._seconds) {
                  orderDate = new Date(
                    order.createdAt._seconds * 1000
                  ).toLocaleDateString();
                }

                return (
                  <tr
                    key={order.id}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="py-3 px-2">
                      <span className="font-medium">
                        #{order.id.slice(0, 6)}
                      </span>
                    </td>

                    <td className="py-3 px-2">
                      {order.customerName}
                    </td>

                    <td className="py-3 px-2 font-semibold">
                      Rs.{" "}
                      {Number(
                        order.total || 0
                      ).toLocaleString()}
                    </td>

                    <td className="py-3 px-2">
                      {order.paymentMethod}
                    </td>

                    <td className="py-3 px-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${statusClass}`}
                      >
                        {order.status}
                      </span>
                    </td>

                    <td className="py-3 px-2 text-gray-500">
                      {orderDate}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
      </div>
    </div>
  );
};

export default Dashboard;