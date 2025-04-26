const UserCart = require("../models/userCart");

// ✅ Add to Cart
const  addToCart = async (req, res) => {
  const { email, productId, username, quantity = 1 } = req.body;

  if (!email || !productId || !username) {
    return res
      .status(400)
      .json({ message: "Missing email, productId, or username" });
  }

  try {
    let user = await UserCart.findOne({ email });

    if (user) {
      const alreadyInCart = user.cart.some(
        (item) => item.productId.toString() === productId
      );

      if (alreadyInCart) {
        return res.status(409).json({ message: "Product already in cart" });
      }

      // Add new product to cart
      user.cart.push({ productId, quantity });
      await user.save();
    } else {
      // New user with name and product
      user = await UserCart.create({
        email,
        name: username,
        cart: [{ productId, quantity }],
      });
    }

    res.status(200).json({ message: "Added to cart", cart: user.cart });
  } catch (err) {
    console.error("Cart error:", err);
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

const addToWishlist = async (req, res) => {
  const { email, productId, username } = req.body;
  if (!email || !productId) {
    return res.status(400).json({ message: "Missing email or productId" });
  }

  try {
    // Check if the user already has this product in their wishlist
    const user = await UserCart.findOne({ email });

    if (user) {
      const alreadyExists = user.wishlist.some(
        (item) => item.productId.toString() === productId
      );

      if (alreadyExists) {
        return res.status(400).json({ message: "Product already in wishlist" });
      }

      // Add new product to wishlist
      user.wishlist.push({ productId });
      await user.save();

      return res
        .status(200)
        .json({ message: "Added to wishlist", wishlist: user.wishlist });
    } else {
      // Create new wishlist document for user
      const newUser = await UserCart.create({
        email,
        username,
        wishlist: [{ productId }],
      });

      return res
        .status(201)
        .json({ message: "Wishlist created", wishlist: newUser.wishlist });
    }
  } catch (err) {
    console.error("Add to wishlist error:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
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
    res
      .status(200)
      .json({ message: "Removed from wishlist", wishlist: user.wishlist });
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

const increaseCartQuantity = async (req, res) => {
  const { email, productId, action } = req.body;

  if (!email || !productId || !action) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const user = await UserCart.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const item = user.cart.find(
      (item) => item.productId.toString() === productId
    );

    if (!item) return res.status(404).json({ message: "Product not in cart" });

    if (action === "increase") {
      item.quantity += 1;
    } else if (action === "decrease" && item.quantity > 1) {
      item.quantity -= 1;
    }

    await user.save();
    res.status(200).json({ message: "Cart updated", cart: user.cart });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


const checkCartItem = async (req, res) => {
  const { email, productId } = req.query;

  try {
    const user = await UserCart.findOne({ email });
    const exists = user?.cart.some(
      (item) => item.productId.toString() === productId
    );

    res.status(200).json({ exists });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error checking cart", error: err.message });
  }
};

module.exports = {
  addToCart,
  removeFromCart,
  addToWishlist,
  removeFromWishlist,
  getUserCartWishlist,
  increaseCartQuantity,
  checkCartItem,
};
