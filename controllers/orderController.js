const Order = require("../models/orderModel");
const Product = require("../models/product");

// ✅ Place a New Order
const placeOrder = async (req, res) => {
  const { name, phone, address, email, items } = req.body;

  if (
    !name ||
    !phone ||
    !address ||
    !items ||
    !Array.isArray(items) ||
    items.length === 0
  ) {
    return res
      .status(400)
      .json({ message: "Missing required fields or items" });
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

    res
      .status(201)
      .json({ message: "Order placed successfully", order: savedOrder });
  } catch (err) {
    console.error("Order placement error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Get All Orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("items.productId");
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
const updateOrderItemStatus = async (req, res) => {
  const { orderId, itemId, status } = req.body;

  try {
    const order = await Order.findById(orderId).populate("items.productId"); // ✅ populate product
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Find the item inside the order
    const item = order.items.id(itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    item.status = status;

    // ✅ If status = accepted, then reduce product stock
    if (status === "accepted") {
      const product = await Product.findById(item.productId._id); // ✅ find the real product

      if (product) {
        if (product.stock >= item.quantity) {
          product.stock -= item.quantity; // ✅ reduce stock by quantity
          await product.save();
        } else {
          return res.status(400).json({ message: "Not enough stock to accept the order" });
        }
      }
    }

    await order.save();

    res.status(200).json({ message: "Item status updated", order });
  } catch (error) {
    console.error("Error updating item status:", error);
    res.status(500).json({ message: "Server error", error: error.message });
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
    const orders = await Order.find({ buyerEmail: email }).populate(
      "items.productId"
    );
    res.status(200).json({ orders });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getOrdersBySellerEmail = async (req, res) => {
  const { email } = req.params; // Seller's email

  try {
    // Fetch all orders with product populated
    const allOrders = await Order.find().populate("items.productId");

    // Filter orders where at least one item belongs to the seller
    const sellerOrders = allOrders.filter((order) => {
      return order.items.some((item) => item.productId?.postedBy === email);
    });

    res.status(200).json({ orders: sellerOrders });
  } catch (error) {
    console.error("Error fetching seller orders:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const checkPurchase = async (req, res) => {
  const { email, productId } = req.query;

  try {
    // Find orders for this user
    const orders = await Order.find({ buyerEmail: email }).populate("items.productId");

    let purchased = false;

    for (const order of orders) {
      for (const item of order.items) {
        if (
          item.productId &&
          item.productId._id.toString() === productId.toString() &&
          item.status === "accepted"
        ) {
          purchased = true;
          break;
        }
      }
      if (purchased) break;
    }

    res.status(200).json({ purchased });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


module.exports = {
  placeOrder,
  getAllOrders,
  getOrderById,
  updateOrderItemStatus,
  deleteOrder,
  getOrdersByUserEmail,
  getOrdersBySellerEmail,
  checkPurchase
};
