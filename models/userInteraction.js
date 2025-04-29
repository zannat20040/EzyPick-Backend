const mongoose = require("mongoose");

const UserInteractionSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["click", "search", "wishlist", "cart", "purchase"],
    required: true,
  },
  productId: {
    type: String,
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  subcategory: {
    type: String,
    required: true,
  },
  seller: {
    type: String,
    required: true,
  },
  price: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});


  mongoose.model("UserInteraction", UserInteractionSchema);
  