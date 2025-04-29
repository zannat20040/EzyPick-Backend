const UserInteraction = require("../models/userInteraction");

const trackUser = async (req, res) => {
  try {
    const { email, type, productId, productName, category, subcategory, seller, price } = req.body;

    if (!email || !type) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    await UserInteraction.create({
      email,
      type,
      productId,
      productName,
      category,
      subcategory,
      seller,
      price,
    });

    res.status(200).json({ message: "Behavior logged" });
  } catch (err) {
    console.error("Track error:", err);
    res.status(500).json({ message: "Failed to log behavior" });
  }
};

module.exports = { trackUser };
