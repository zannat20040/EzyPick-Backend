const express = require("express");
const router = express.Router();
const {
  addToCart,
  removeFromCart,
  addToWishlist,
  removeFromWishlist,
  getUserCartWishlist,
  increaseCartQuantity,
  checkCartItem,
} = require("../controllers/cartController");

router.post("/cart/add", addToCart);
router.post("/cart/remove", removeFromCart);
router.post("/cart/increase", increaseCartQuantity);
router.get("/check-cart", checkCartItem);

router.post("/wishlist/add", addToWishlist);
router.post("/wishlist/remove", removeFromWishlist);
router.get("/user/:email", getUserCartWishlist);

module.exports = router;
