const express = require("express");
const router = express.Router();
const {
  placeOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  getOrdersByUserEmail
} = require("../controllers/orderController");

// Place a new order
router.post("/orders", placeOrder);

// Get all orders
router.get("/orders", getAllOrders);

// Get single order by ID
router.get("/orders/:id", getOrderById);

// Update an order (e.g., change status)
router.patch("/orders/:id", updateOrder);

// Delete an order
router.delete("/orders/:id", deleteOrder);
router.get("/orders/user/:email", getOrdersByUserEmail);


module.exports = router;
