const express = require("express");

const {
  addCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

const router = express.Router();

// Add category
router.post("/", addCategory);

// Get all categories
router.get("/", getCategories);

// Get single category
router.get("/:id", getCategory);

// Update category
router.put("/:id", updateCategory);

// Delete category
router.delete("/:id", deleteCategory);

module.exports = router;