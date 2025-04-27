const express = require("express");
const router = express.Router();
const {
  placeOrder,
  getAllOrders,
  getOrderById,
  deleteOrder,
  getOrdersByUserEmail,
  getOrdersBySellerEmail,
  updateOrderItemStatus
} = require("../controllers/orderController");

// Place a new order
router.post("/orders", placeOrder);

// Get all orders
router.get("/orders", getAllOrders);

// Get single order by ID
router.get("/orders/:id", getOrderById);

// Update an order (e.g., change status)
router.patch("/orders/item/status", updateOrderItemStatus);

// Delete an order
router.delete("/orders/:id", deleteOrder);
router.get("/orders/user/:email", getOrdersByUserEmail);
router.get("/orders/seller/:email", getOrdersBySellerEmail);


module.exports = router;
