const UserCart = require("../models/userCart");

// ✅ Add to Cart
const addToCart = async (req, res) => {
  const { email, productId, quantity = 1 } = req.body;
  if (!email || !productId) {
    return res.status(400).json({ message: "Missing email or productId" });
  }

  try {
    const user = await UserCart.findOneAndUpdate(
      { email },
      {
        $addToSet: {
          cart: { productId, quantity },
        },
      },
      { upsert: true, new: true }
    );
    res.status(200).json({ message: "Added to cart", cart: user.cart });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Remove from Cart
const removeFromCart = async (req, res) => {
  const { email, productId } = req.body;
  if (!email || !productId) {
    return res.status(400).json({ message: "Missing email or productId" });
  }

  try {
    const user = await UserCart.findOneAndUpdate(
      { email },
      {
        $pull: { cart: { productId } },
      },
      { new: true }
    );
    res.status(200).json({ message: "Removed from cart", cart: user.cart });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Add to Wishlist
const addToWishlist = async (req, res) => {
  const { email, productId } = req.body;
  if (!email || !productId) {
    return res.status(400).json({ message: "Missing email or productId" });
  }

  try {
    const user = await UserCart.findOneAndUpdate(
      { email },
      {
        $addToSet: { wishlist: { productId } },
      },
      { upsert: true, new: true }
    );
    res.status(200).json({ message: "Added to wishlist", wishlist: user.wishlist });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Remove from Wishlist
const removeFromWishlist = async (req, res) => {
  const { email, productId } = req.body;
  if (!email || !productId) {
    return res.status(400).json({ message: "Missing email or productId" });
  }

  try {
    const user = await UserCart.findOneAndUpdate(
      { email },
      {
        $pull: { wishlist: { productId } },
      },
      { new: true }
    );
    res.status(200).json({ message: "Removed from wishlist", wishlist: user.wishlist });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Get Cart & Wishlist With Populated Product Details
const getUserCartWishlist = async (req, res) => {
  const { email } = req.params;

  try {
    const user = await UserCart.findOne({ email })
      .populate("cart.productId")
      .populate("wishlist.productId");

    if (!user) {
      return res.status(200).json({ cart: [], wishlist: [] });
    }

    res.status(200).json({
      cart: user.cart,
      wishlist: user.wishlist,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  addToCart,
  removeFromCart,
  addToWishlist,
  removeFromWishlist,
  getUserCartWishlist,
};
