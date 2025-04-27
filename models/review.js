const mongoose = require("mongoose");

const responseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  username: { type: String, required: true },
  userImage: { type: String, default: "" }, // <-- added
  responseText: { type: String, required: true },
  responseType: { type: String, enum: ["seller", "customer"], required: true },
  responseDate: { type: Date, default: Date.now },
});

const reviewSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    username: { type: String, required: true },
    userImage: { type: String, default: "" }, // <-- added
    rating: { type: Number, required: true, min: 1, max: 5 },
    reviewText: { type: String, required: true },
    reviewTitle: { type: String, required: true },
    reviewDate: { type: Date, default: Date.now },
    verifiedPurchase: { type: Boolean, default: false },
    helpfulCount: { type: Number, default: 0 },
    notHelpfulCount: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    responses: [responseSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.models.Review || mongoose.model("Review", reviewSchema);
