const express = require("express");
const router = express.Router();
const { addNewProduct } = require("../controllers/productController");

router.post("/add", addNewProduct);

module.exports = router;
