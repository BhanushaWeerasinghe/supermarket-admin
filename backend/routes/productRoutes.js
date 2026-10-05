const express = require("express");

const {
  addProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const router = express.Router();

// Add product
router.post("/", addProduct);

// Get all products
router.get("/", getProducts);

// Get single product
router.get("/:id", getProduct);

// Update product
router.put("/:id", updateProduct);

// Delete product
router.delete("/:id", deleteProduct);

module.exports = router;