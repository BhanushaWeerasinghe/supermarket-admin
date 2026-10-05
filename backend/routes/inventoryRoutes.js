const express = require("express");

const {
  getInventory,
  updateStock,
} = require("../controllers/inventoryController");

const router = express.Router();

// Get inventory
router.get("/", getInventory);

// Update product stock
router.put("/:id", updateStock);

module.exports = router;