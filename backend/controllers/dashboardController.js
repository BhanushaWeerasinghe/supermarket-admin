const { db } = require("../config/firebase-admin");

const getDashboardStats = async (req, res) => {
  try {
    // =========================
    // Get Firestore data
    // ================ 

    const productsSnapshot = await db.collection("products").get();
    const customersSnapshot = await db.collection("customers").get();
    const ordersSnapshot = await db.collection("orders").get();

    const products = productsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const customers = customersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const orders = ordersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // =========================
    // Total Sales
    // =========================

    const totalSales = orders.reduce(
      (sum, order) => sum + Number(order.total || 0),
      0
    );

    // =========================
    // Low Stock Products
    // =========================

    const lowStockProducts = products.filter(
      (product) => Number(product.quantity || 0) <= 10
    );

    // =========================
    // Total Inventory
    // =========================

    const totalInventory = products.reduce(
      (sum, product) => sum + Number(product.quantity || 0),
      0
    );

    // =========================
    // Monthly Sales
    // =========================

    const monthlySales = [
      { month: "Jan", sales: 0 },
      { month: "Feb", sales: 0 },
      { month: "Mar", sales: 0 },
      { month: "Apr", sales: 0 },
      { month: "May", sales: 0 },
      { month: "Jun", sales: 0 },
      { month: "Jul", sales: 0 },
      { month: "Aug", sales: 0 },
      { month: "Sep", sales: 0 },
      { month: "Oct", sales: 0 },
      { month: "Nov", sales: 0 },
      { month: "Dec", sales: 0 },
    ];

    orders.forEach((order) => {
      if (!order.createdAt) return;

      let date;

      // Firestore Timestamp
      if (order.createdAt._seconds) {
        date = new Date(order.createdAt._seconds * 1000);
      } else {
        date = new Date(order.createdAt);
      }

      if (isNaN(date.getTime())) return;

      const monthIndex = date.getMonth();

      monthlySales[monthIndex].sales += Number(order.total || 0);
    });

    // =========================
    // Top Selling Products
    // =========================

    const productSales = {};

    orders.forEach((order) => {
      if (!Array.isArray(order.items)) return;

      order.items.forEach((item) => {
        const productId = item.productId;

        if (!productId) return;

        if (!productSales[productId]) {
          productSales[productId] = {
            productId: productId,
            name: item.productName || "Unknown Product",
            quantity: 0,
          };
        }

        productSales[productId].quantity += Number(
          item.quantity || 0
        );
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // =========================
    // Recent Orders
    // =========================

    const recentOrders = [...orders]
      .sort((a, b) => {
        const dateA = a.createdAt?._seconds || 0;
        const dateB = b.createdAt?._seconds || 0;

        return dateB - dateA;
      })
      .slice(0, 5);

    // =========================
    // Send Response
    // =========================

    res.status(200).json({
      success: true,

      stats: {
        totalSales,
        totalProducts: products.length,
        totalOrders: orders.length,
        totalCustomers: customers.length,
        totalInventory,
      },

      monthlySales,

      topProducts,

      lowStockProducts,

      recentOrders,
    });
  } catch (error) {
    console.error("Dashboard error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load dashboard",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
};