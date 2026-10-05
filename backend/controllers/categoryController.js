const { db } = require("../config/firebase-admin");

// Add Category
const addCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const category = {
      name,
      description: description || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await db.collection("categories").add(category);

    res.status(201).json({
      success: true,
      message: "Category added successfully",
      categoryId: docRef.id,
      category: {
        id: docRef.id,
        ...category,
      },
    });
  } catch (error) {
    console.error("Add category error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to add category",
      error: error.message,
    });
  }
};

// Get All Categories
const getCategories = async (req, res) => {
  try {
    const snapshot = await db
      .collection("categories")
      .orderBy("createdAt", "desc")
      .get();

    const categories = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get categories",
      error: error.message,
    });
  }
};

// Get Single Category
const getCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await db.collection("categories").doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.json({
      success: true,
      category: {
        id: doc.id,
        ...doc.data(),
      },
    });
  } catch (error) {
    console.error("Get category error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get category",
      error: error.message,
    });
  }
};

// Update Category
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const categoryRef = db.collection("categories").doc(id);
    const categoryDoc = await categoryRef.get();

    if (!categoryDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const updatedData = {
      ...req.body,
      updatedAt: new Date(),
    };

    await categoryRef.update(updatedData);

    res.json({
      success: true,
      message: "Category updated successfully",
    });
  } catch (error) {
    console.error("Update category error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update category",
      error: error.message,
    });
  }
};

// Delete Category
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const categoryRef = db.collection("categories").doc(id);
    const categoryDoc = await categoryRef.get();

    if (!categoryDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    await categoryRef.delete();

    res.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete category error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete category",
      error: error.message,
    });
  }
};

module.exports = {
  addCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
};