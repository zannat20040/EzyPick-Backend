const express = require("express");
const router = express.Router();
const {
  addNewProduct,
  getProductsWithOffers,
  getAllProducts,
  getSingleProduct,
} = require("../controllers/productController");

router.post("/add", addNewProduct);
router.get("/offers", getProductsWithOffers);
router.get("/", getAllProducts);
router.get("/:id", getSingleProduct);

module.exports = router;
