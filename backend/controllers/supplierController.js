const { db } = require("../config/firebase-admin");

// Add Supplier
const addSupplier = async (req, res) => {
  try {
    const {
      name,
      company,
      phone,
      email,
      address,
    } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Supplier name and phone are required",
      });
    }

    const supplier = {
      name,
      company: company || "",
      phone,
      email: email || "",
      address: address || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await db
      .collection("suppliers")
      .add(supplier);

    res.status(201).json({
      success: true,
      message: "Supplier added successfully",
      supplierId: docRef.id,
      supplier: {
        id: docRef.id,
        ...supplier,
      },
    });
  } catch (error) {
    console.error("Add supplier error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to add supplier",
      error: error.message,
    });
  }
};

// Get All Suppliers
const getSuppliers = async (req, res) => {
  try {
    const snapshot = await db
      .collection("suppliers")
      .orderBy("createdAt", "desc")
      .get();

    const suppliers = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({
      success: true,
      count: suppliers.length,
      suppliers,
    });
  } catch (error) {
    console.error("Get suppliers error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get suppliers",
      error: error.message,
    });
  }
};

// Get Single Supplier
const getSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await db
      .collection("suppliers")
      .doc(id)
      .get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    res.json({
      success: true,
      supplier: {
        id: doc.id,
        ...doc.data(),
      },
    });
  } catch (error) {
    console.error("Get supplier error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get supplier",
      error: error.message,
    });
  }
};

// Update Supplier
const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    const supplierRef = db
      .collection("suppliers")
      .doc(id);

    const supplierDoc = await supplierRef.get();

    if (!supplierDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    const updatedData = {
      ...req.body,
      updatedAt: new Date(),
    };

    await supplierRef.update(updatedData);

    res.json({
      success: true,
      message: "Supplier updated successfully",
    });
  } catch (error) {
    console.error("Update supplier error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update supplier",
      error: error.message,
    });
  }
};

// Delete Supplier
const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    const supplierRef = db
      .collection("suppliers")
      .doc(id);

    const supplierDoc = await supplierRef.get();

    if (!supplierDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    await supplierRef.delete();

    res.json({
      success: true,
      message: "Supplier deleted successfully",
    });
  } catch (error) {
    console.error("Delete supplier error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete supplier",
      error: error.message,
    });
  }
};

module.exports = {
  addSupplier,
  getSuppliers,
  getSupplier,
  updateSupplier,
  deleteSupplier,
};
