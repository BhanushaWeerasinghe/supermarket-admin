const { db } = require("../config/firebase-admin");

// Create Order
const createOrder = async (req, res) => {
  try {
    const {
      customerId,
      customerName,
      items,
      subtotal,
      discount = 0,
      total,
      paymentMethod,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order must contain at least one product",
      });
    }

    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Payment method is required",
      });
    }

    // Check all products and stock first
    const productRefs = [];
    const productData = [];

    for (const item of items) {
      const productRef = db
        .collection("products")
        .doc(item.productId);

      const productDoc = await productRef.get();

      if (!productDoc.exists) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.productName}`,
        });
      }

      const product = productDoc.data();
      const currentStock = Number(product.quantity || 0);
      const orderQuantity = Number(item.quantity || 0);

      if (orderQuantity <= 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid quantity for ${item.productName}`,
        });
      }

      if (currentStock < orderQuantity) {
        return res.status(400).json({
          success: false,
          message: `Not enough stock for ${item.productName}. Available: ${currentStock}`,
        });
      }

      productRefs.push(productRef);

      productData.push({
        ref: productRef,
        currentStock,
        orderQuantity,
      });
    }

    // Reduce product stock
    for (const product of productData) {
      await product.ref.update({
        quantity: product.currentStock - product.orderQuantity,
        updatedAt: new Date(),
      });
    }

    // Create order
    const order = {
      customerId: customerId || "",
      customerName: customerName || "Walk-in Customer",
      items,
      subtotal: Number(subtotal || 0),
      discount: Number(discount || 0),
      total: Number(total || 0),
      paymentMethod,
      status: "Pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const orderRef = await db.collection("orders").add(order);

    res.status(201).json({
      success: true,
      message: "Order created successfully and stock updated",
      orderId: orderRef.id,
      order: {
        id: orderRef.id,
        ...order,
      },
    });
  } catch (error) {
    console.error("Create order error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message,
    });
  }
};

// Get All Orders
const getOrders = async (req, res) => {
  try {
    const snapshot = await db
      .collection("orders")
      .orderBy("createdAt", "desc")
      .get();

    const orders = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get orders",
      error: error.message,
    });
  }
};

// Get Single Order
const getOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await db
      .collection("orders")
      .doc(id)
      .get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      order: {
        id: doc.id,
        ...doc.data(),
      },
    });
  } catch (error) {
    console.error("Get order error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get order",
      error: error.message,
    });
  }
};

// Update Order Status
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "Pending",
      "Processing",
      "Completed",
      "Cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const orderRef = db.collection("orders").doc(id);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    await orderRef.update({
      status,
      updatedAt: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
    });
  } catch (error) {
    console.error("Update order status error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error.message,
    });
  }
};

// Delete Order
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const orderRef = db.collection("orders").doc(id);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const order = orderDoc.data();

    // Restore product stock
    if (order.items && order.items.length > 0) {
      for (const item of order.items) {
        const productRef = db
          .collection("products")
          .doc(item.productId);

        const productDoc = await productRef.get();

        if (productDoc.exists) {
          const product = productDoc.data();

          const currentStock = Number(
            product.quantity || 0
          );

          const orderQuantity = Number(
            item.quantity || 0
          );

          await productRef.update({
            quantity: currentStock + orderQuantity,
            updatedAt: new Date(),
          });
        }
      }
    }

    // Delete order
    await orderRef.delete();

    res.status(200).json({
      success: true,
      message:
        "Order deleted successfully and stock restored",
    });
  } catch (error) {
    console.error("Delete order error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete order",
      error: error.message,
    });
  }
};
const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      customerId,
      customerName,
      items,
      subtotal,
      discount,
      total,
      paymentMethod,
    } = req.body;

    const orderRef = db.collection("orders").doc(id);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const oldOrder = orderDoc.data();

    // Restore stock from the old order
    if (Array.isArray(oldOrder.items)) {
      for (const item of oldOrder.items) {
        const productRef = db
          .collection("products")
          .doc(item.productId);

        const productDoc = await productRef.get();

        if (productDoc.exists) {
          const product = productDoc.data();

          await productRef.update({
            quantity:
              Number(product.quantity || 0) +
              Number(item.quantity || 0),
            updatedAt: new Date(),
          });
        }
      }
    }

    // Deduct stock for the new order
    if (Array.isArray(items)) {
      for (const item of items) {
        const productRef = db
          .collection("products")
          .doc(item.productId);

        const productDoc = await productRef.get();

        if (!productDoc.exists) {
          return res.status(404).json({
            success: false,
            message: `Product not found: ${item.productName}`,
          });
        }

        const product = productDoc.data();
        const currentStock = Number(product.quantity || 0);
        const orderQuantity = Number(item.quantity || 0);

        if (currentStock < orderQuantity) {
          return res.status(400).json({
            success: false,
            message: `Not enough stock for ${item.productName}`,
          });
        }

        await productRef.update({
          quantity: currentStock - orderQuantity,
          updatedAt: new Date(),
        });
      }
    }

    await orderRef.update({
      customerId: customerId || "",
      customerName: customerName || "Walk-in Customer",
      items: items || [],
      subtotal: Number(subtotal || 0),
      discount: Number(discount || 0),
      total: Number(total || 0),
      paymentMethod: paymentMethod || "Cash",
      updatedAt: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Order updated successfully",
    });
  } catch (error) {
    console.error("Update order error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update order",
      error: error.message,
    });
  }
};
module.exports = {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  updateOrder,
  deleteOrder,
};