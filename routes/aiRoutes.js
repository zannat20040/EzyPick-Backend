const express = require("express");
const router = express.Router();
const { searchProducts } = require("../controllers/searchController");
const { recommendProducts } = require("../controllers/productController");

router.post("/search", searchProducts);
router.post("/recommend", recommendProducts);
module.exports = router;
