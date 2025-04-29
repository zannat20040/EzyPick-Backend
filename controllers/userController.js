const User = require("../models/user");

// register controller
const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      role,
      profile_img,
      company_name,
      company_logo,
      company_email,
      company_phone,
      company_address,
      documents,
      verification_status,
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    if (!name || !email || !role) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (role === "seller") {
      if (!company_name || !company_email || !company_logo || !phone) {
        return res.status(400).json({
          message: "Seller must provide company name, email, and logo",
        });
      }
    }

    const newUser = new User({
      name,
      email,
      phone,
      address,
      role,
      profile_img,
      company_name,
      company_logo,
      company_phone,
      company_email,
      company_address,
      documents,
      verification_status,
    });

    await newUser.save();

    res
      .status(201)
      .json({ message: "User registered successfully", user: newUser });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to register user", error: err.message });
  }
};

const getUserByEmail = async (req, res) => {
  const { email } = req.params;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ user });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch user", error: err.message });
  }
};

// ✅ Get all sellers
const getAllSellers = async (req, res) => {
  try {
    const sellers = await User.find({ role: "seller" }).sort({ createdAt: -1 }); // latest first
    res.status(200).json(sellers);
  } catch (error) {
    console.error("Error fetching sellers:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// in userController.js
const updateSellerStatus = async (req, res) => {
  const { sellerId } = req.params;
  const { verification_status } = req.body;

  if (!verification_status) {
    return res.status(400).json({ message: "Status is required" });
  }

  try {
    const seller = await User.findById(sellerId);
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    seller.verification_status = verification_status;
    await seller.save();

    res.status(200).json({ message: "Seller status updated successfully", seller });
  } catch (error) {
    console.error("Error updating seller status:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


module.exports = {
  registerUser,
  getUserByEmail,
  getAllSellers, 
  updateSellerStatus
};

