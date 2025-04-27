const express = require("express");
const router = express.Router();
const {
  placeOrder,
  getAllOrders,
  getOrderById,
  deleteOrder,
  getOrdersByUserEmail,
  getOrdersBySellerEmail,
  updateOrderItemStatus,
  checkPurchase,
} = require("../controllers/orderController");

// ✅ First, put check-purchase route BEFORE :id
router.post("/orders", placeOrder);
router.get("/orders", getAllOrders);

router.get("/orders/check-purchase", checkPurchase); // ✅ Here first
router.get("/orders/:id", getOrderById); // ✅ After

router.patch("/orders/item/status", updateOrderItemStatus);
router.delete("/orders/:id", deleteOrder);
router.get("/orders/user/:email", getOrdersByUserEmail);
router.get("/orders/seller/:email", getOrdersBySellerEmail);

module.exports = router;
