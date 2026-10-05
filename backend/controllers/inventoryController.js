const { db } = require("../config/firebase-admin");

// Get inventory
const getInventory = async (req, res) => {
  try {
    const snapshot = await db
      .collection("products")
      .get();

    const inventory = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json({
      success: true,
      count: inventory.length,
      inventory: inventory,
    });
  } catch (error) {
    console.error("Get inventory error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get inventory",
      error: error.message,
    });
  }
};

// Update stock
const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined || quantity === null) {
      return res.status(400).json({
        success: false,
        message: "Quantity is required",
      });
    }

    if (Number(quantity) < 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity cannot be negative",
      });
    }

    const productRef = db
      .collection("products")
      .doc(id);

    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await productRef.update({
      quantity: Number(quantity),
      updatedAt: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Stock updated successfully",
    });
  } catch (error) {
    console.error("Update stock error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update stock",
      error: error.message,
    });
  }
};

module.exports = {
  getInventory,
  updateStock,
};