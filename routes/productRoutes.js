const express = require("express");
const router = express.Router();
const {
  addNewProduct,
  getProductsWithOffers,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  getProductsByUser,
  deleteProduct,
} = require("../controllers/productController");

router.post("/add", addNewProduct);
router.get("/offers", getProductsWithOffers);
router.get("/", getAllProducts);
router.get("/:id", getSingleProduct);
router.put("/:id", updateProduct);
router.get("/user/:email", getProductsByUser);
router.delete("/:id", deleteProduct);


module.exports = router;
