const express = require("express");
const router = express.Router();
const {
  addNewProduct,
  getProductsWithOffers,
  getAllProducts,
} = require("../controllers/productController");

router.post("/add", addNewProduct);
router.get("/offers", getProductsWithOffers);
router.get("/", getAllProducts);

module.exports = router;
