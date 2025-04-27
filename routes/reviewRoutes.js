const express = require("express");
const { createReview, getProductReviews, addResponseToReview } = require("../controllers/reviewController");
const router = express.Router();

// ✅ Post a review
router.post("/reviews", createReview);

// ✅ Get all reviews for a product
router.get("/reviews/:productId", getProductReviews);

// ✅ Add response to a review
router.post("/reviews/:reviewId/responses", addResponseToReview);

module.exports = router;
