const express = require("express");
const router = express.Router();
const {
  registerUser,
  getUserByEmail,
  getAllSellers,
  updateSellerStatus,
} = require("../controllers/userController");

router.post("/register", registerUser);
router.get("/sellers", getAllSellers); 
router.get("/:email", getUserByEmail);
router.patch("/update-status/:sellerId", updateSellerStatus);


module.exports = router;
