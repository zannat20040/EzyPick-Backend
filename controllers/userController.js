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

// login controller
// const loginUser = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(400).json({ error: "User not found." });
//     }

//     // Compare entered password with stored hash
//     const isMatch = await bcryptjs.compare(password, user.password);

//     if (!isMatch) {
//       return res.status(400).json({ error: "Invalid credentials." });
//     }

//     res.status(200).json({ message: "Login successful!", user });
//   } catch (err) {
//     res
//       .status(500)
//       .json({ error: "Something went wrong. Please try again later." });
//   }
// };

module.exports = { registerUser };
