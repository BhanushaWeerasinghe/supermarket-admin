const { db } = require("../config/firebase-admin");

// Add Customer
const addCustomer = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      address,
    } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Customer name and phone are required",
      });
    }

    const customer = {
      name,
      phone,
      email: email || "",
      address: address || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await db
      .collection("customers")
      .add(customer);

    res.status(201).json({
      success: true,
      message: "Customer added successfully",
      customerId: docRef.id,
      customer: {
        id: docRef.id,
        ...customer,
      },
    });
  } catch (error) {
    console.error("Add customer error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to add customer",
      error: error.message,
    });
  }
};

// Get All Customers
const getCustomers = async (req, res) => {
  try {
    const snapshot = await db
      .collection("customers")
      .orderBy("createdAt", "desc")
      .get();

    const customers = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({
      success: true,
      count: customers.length,
      customers,
    });
  } catch (error) {
    console.error("Get customers error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get customers",
      error: error.message,
    });
  }
};

// Get Single Customer
const getCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await db
      .collection("customers")
      .doc(id)
      .get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.json({
      success: true,
      customer: {
        id: doc.id,
        ...doc.data(),
      },
    });
  } catch (error) {
    console.error("Get customer error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get customer",
      error: error.message,
    });
  }
};

// Update Customer
const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const customerRef = db
      .collection("customers")
      .doc(id);

    const customerDoc = await customerRef.get();

    if (!customerDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const updatedData = {
      ...req.body,
      updatedAt: new Date(),
    };

    await customerRef.update(updatedData);

    res.json({
      success: true,
      message: "Customer updated successfully",
    });
  } catch (error) {
    console.error("Update customer error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update customer",
      error: error.message,
    });
  }
};

// Delete Customer
const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const customerRef = db
      .collection("customers")
      .doc(id);

    const customerDoc = await customerRef.get();

    if (!customerDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    await customerRef.delete();

    res.json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    console.error("Delete customer error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete customer",
      error: error.message,
    });
  }
};

module.exports = {
  addCustomer,
  getCustomers,
  getCustomer,
  updateCustomer,
  deleteCustomer,
};