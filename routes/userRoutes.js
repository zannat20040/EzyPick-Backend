const express = require("express");
const router = express.Router();
const {
  registerUser,
  getUserByEmail,
} = require("../controllers/userController");

router.post("/register", registerUser);
router.get("/:email", getUserByEmail);

module.exports = router;
