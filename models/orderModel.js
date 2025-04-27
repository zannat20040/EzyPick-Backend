const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  requirement: {
    type: String,
    required: true,
  },
  deliveryOption: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1, // ✅ default 1 if not specified
  },
  buyerName: String,
  buyerPhone: String,
  buyerAddress: String,
});

const orderSchema = new mongoose.Schema(
  {
    buyerName: {
      type: String,
      required: true,
    },
    buyerPhone: {
      type: String,
      required: true,
    },
    buyerAddress: {
      type: String,
      required: true,
    },
    items: [orderItemSchema],
    status: {
      type: String,
      default: "pending", // Other options: confirmed, shipped, delivered, cancelled
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Order || mongoose.model("Order", orderSchema);
