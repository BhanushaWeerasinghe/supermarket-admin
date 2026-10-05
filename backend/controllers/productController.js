const { db } = require("../config/firebase-admin");

// Add Product
const addProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      price,
      quantity,
      barcode,
      description,
      imageUrl,
    } = req.body;

    if (!name || !category || price === undefined || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "Name, category, price and quantity are required",
      });
    }
    const normalizedName = name.trim().toLowerCase();

    const product = {
      name: name.trim(),
      normalizedName,
      category,
      price: Number(price),
      quantity: Number(quantity),
      barcode: barcode || "",
      description: description || "",
      imageUrl: imageUrl || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

const existingSnapshot = await db
  .collection("products")
  .where("barcode", "==", barcode || "")
  .where("name", "==", name.trim())
  .where("price", "==", Number(price))
  .limit(1)
  .get();

    if (!existingSnapshot.empty && barcode) {
      const existingDoc = existingSnapshot.docs[0];
      const existingProduct = existingDoc.data();

      await existingDoc.ref.update({
        quantity:
          Number(existingProduct.quantity || 0) +
          Number(quantity),
        updatedAt: new Date(),
      });

      return res.status(200).json({
        success: true,
        message: "Product quantity updated successfully",
        productId: existingDoc.id,
      });
    }

    const docRef = await db.collection("products").add(product);

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      productId: docRef.id,
      product: {
        id: docRef.id,
        ...product,
      },
    });
  } catch (error) {
    console.error("Add product error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to add product",
      error: error.message,
    });
  }
};

// Get All Products
const getProducts = async (req, res) => {
  try {
    const snapshot = await db
      .collection("products")
      .orderBy("createdAt", "desc")
      .get();

    const products = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get products error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get products",
      error: error.message,
    });
  }
};

// Get Single Product
const getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await db.collection("products").doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      product: {
        id: doc.id,
        ...doc.data(),
      },
    });
  } catch (error) {
    console.error("Get product error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get product",
      error: error.message,
    });
  }
};

// Update Product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const productRef = db.collection("products").doc(id);
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const updatedData = {
      ...req.body,
      updatedAt: new Date(),
    };

    if (updatedData.price !== undefined) {
      updatedData.price = Number(updatedData.price);
    }

    if (updatedData.quantity !== undefined) {
      updatedData.quantity = Number(updatedData.quantity);
    }

    await productRef.update(updatedData);

    res.json({
      success: true,
      message: "Product updated successfully",
    });
  } catch (error) {
    console.error("Update product error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: error.message,
    });
  }
};

// Delete Product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const productRef = db.collection("products").doc(id);
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await productRef.delete();

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete product",
      error: error.message,
    });
  }
};

module.exports = {
  addProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
};