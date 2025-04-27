const Order = require("../models/orderModel");

// ✅ Place a New Order
const placeOrder = async (req, res) => {
  const { name, phone, address,email, items } = req.body;

  if (!name || !phone || !address || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Missing required fields or items" });
  }

  try {
    const newOrder = new Order({
      buyerName: name,
      buyerPhone: phone,
      buyerAddress: address,
      buyerEmail: email,
      items: items.map((item) => ({
        productId: item.productId,
        requirement: item.requirement,
        quantity: item.quantity,
        deliveryOption: item.deliveryOption,
        buyerName: item.buyerName,
        buyerPhone: item.buyerPhone,
        buyerAddress: item.buyerAddress,
      })),
      status: "pending",
    });

    const savedOrder = await newOrder.save();

    res.status(201).json({ message: "Order placed successfully", order: savedOrder });
  } catch (err) {
    console.error("Order placement error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Get All Orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).populate("items.productId");
    res.status(200).json(orders);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Get Single Order By ID
const getOrderById = async (req, res) => {
  const { id } = req.params;

  try {
    const order = await Order.findById(id).populate("items.productId");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(order);
  } catch (err) {
    console.error("Error fetching order:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Update an Order (status or details)
const updateOrder = async (req, res) => {
  const { id } = req.params;
  const { status, buyerName, buyerPhone, buyerAddress } = req.body;

  try {
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (status) order.status = status;
    if (buyerName) order.buyerName = buyerName;
    if (buyerPhone) order.buyerPhone = buyerPhone;
    if (buyerAddress) order.buyerAddress = buyerAddress;

    const updatedOrder = await order.save();
    res.status(200).json({ message: "Order updated", order: updatedOrder });
  } catch (err) {
    console.error("Error updating order:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Delete an Order
const deleteOrder = async (req, res) => {
  const { id } = req.params;

  try {
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    await order.deleteOne();
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (err) {
    console.error("Error deleting order:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// In orderController.js
const getOrdersByUserEmail = async (req, res) => {
  const { email } = req.params;

  try {
    const orders = await Order.find({ buyerEmail: email }).populate("items.productId");
    res.status(200).json({ orders });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



module.exports = {
  placeOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  getOrdersByUserEmail
};
