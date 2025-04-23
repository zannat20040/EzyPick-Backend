const express = require("express");
const router = express.Router();
const { addNewProduct, getProductsWithOffers } = require("../controllers/productController");

router.post("/add", addNewProduct);
router.get("/offers", getProductsWithOffers);

module.exports = router;
