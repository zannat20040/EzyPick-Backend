const express = require("express");
const router = express.Router();
const { searchProducts } = require("../controllers/searchController");
const { recommendProducts } = require("../controllers/productController");
const { trackUser } = require("../controllers/trackController");

router.post("/search", searchProducts);
router.post("/recommend", recommendProducts);
router.post("/track-behavior", trackUser);
module.exports = router;
