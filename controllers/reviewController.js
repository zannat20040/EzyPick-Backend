const Review = require("../models/review");
const Order = require("../models/orderModel");

// ✅ Create New Review
const createReview = async (req, res) => {
  try {
    const {
      productId,
      userId,
      username,
      userImage, // <-- new field
      rating,
      reviewText,
      reviewTitle,
      verifiedPurchase,
    } = req.body;

    const newReview = new Review({
      productId,
      userId,
      username,
      userImage, // <-- save the image
      rating,
      reviewText,
      reviewTitle,
      verifiedPurchase,
    });

    const savedReview = await newReview.save();

    res.status(201).json({ message: "Review posted successfully!", review: savedReview });
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Get Reviews for a Product
const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ productId }).sort({ createdAt: -1 });

    res.status(200).json({ reviews });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Add a Response to a Review
const addResponseToReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { userId, username, userImage, responseText, responseType } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });

    review.responses.push({
      userId,
      username,
      userImage, // <-- save the image inside response too
      responseText,
      responseType,
    });

    await review.save();

    res.status(200).json({ message: "Response added!", review });
  } catch (error) {
    console.error("Error adding response:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


  

module.exports = {
  createReview,
  getProductReviews,
  addResponseToReview,
};
