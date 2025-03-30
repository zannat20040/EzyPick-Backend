const bcryptjs = require("bcryptjs");
const User = require("../models/user");

// register controller
const registerUser = async (req, res) => {
  const { firstname, lastname, email, password, role, isGoogleUser } = req.body;

  try {
    // Ensure both first and last names are present
    if (!firstname || !lastname) {
      return res
        .status(400)
        .json({ error: "First name and last name are required." });
    }

    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email is already in use." });
    }

    const newUser = new User({
      name: `${firstname} ${lastname}`,
      email,
      password: isGoogleUser ? undefined : password, // Don't set password for Google users
      role,
      isGoogleUser: isGoogleUser || false, // Mark as Google user if applicable
    });

    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    console.log(err)
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((error) => error.message);
      return res.status(400).json({ error: errors });
    }

    // For duplicate emails or other errors
    if (err.code === 11000) {
      return res.status(400).json({ error: "Email is already in use." });
    }

    // For any other server error
    res
      .status(500)
      .json({ error: "Something went wrong. Please try again later." });
  }
};


// login controller
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "User not found." });
    }

    // Compare entered password with stored hash
    const isMatch = await bcryptjs.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials." });
    }

    res.status(200).json({ message: "Login successful!", user });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Something went wrong. Please try again later." });
  }
};

module.exports = { registerUser, loginUser };

module.exports = {
  registerUser,
  loginUser,
};
