const Review = require("../models/review");

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

    res
      .status(201)
      .json({ message: "Review posted successfully!", review: savedReview });
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
    const { userId, username, userImage, responseText, responseType } =
      req.body;

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


const likeReview = async (req, res) => {
  const { reviewId } = req.params;
  const { email } = req.body;

  try {
    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });

    const alreadyLiked = review.likedBy.includes(email);
    const alreadyDisliked = review.dislikedBy.includes(email);

    if (alreadyLiked) {
      // Remove like (toggle off)
      review.likes -= 1;
      review.likedBy = review.likedBy.filter((e) => e !== email);
    } else {
      // Remove previous dislike if any
      if (alreadyDisliked) {
        review.dislikes -= 1;
        review.dislikedBy = review.dislikedBy.filter((e) => e !== email);
      }
      // Add like
      review.likes += 1;
      review.likedBy.push(email);
    }

    await review.save();

    res.status(200).json({ message: "Like status updated", review });
  } catch (error) {
    console.error("Error liking review:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const dislikeReview = async (req, res) => {
  const { reviewId } = req.params;
  const { email } = req.body;

  try {
    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });

    const alreadyLiked = review.likedBy.includes(email);
    const alreadyDisliked = review.dislikedBy.includes(email);

    if (alreadyDisliked) {
      // Remove dislike (toggle off)
      review.dislikes -= 1;
      review.dislikedBy = review.dislikedBy.filter((e) => e !== email);
    } else {
      // Remove previous like if any
      if (alreadyLiked) {
        review.likes -= 1;
        review.likedBy = review.likedBy.filter((e) => e !== email);
      }
      // Add dislike
      review.dislikes += 1;
      review.dislikedBy.push(email);
    }

    await review.save();

    res.status(200).json({ message: "Dislike status updated", review });
  } catch (error) {
    console.error("Error disliking review:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



module.exports = {
  createReview,
  getProductReviews,
  addResponseToReview,
  likeReview,
  dislikeReview,
};
