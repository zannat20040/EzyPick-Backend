const express = require("express");
const router = express.Router();
const {
  addCategory,
  addSubcategory,
  getAllCategories,
  getSubcategoriesByCategory,
} = require("../controllers/categoryController");

router.post("/", addCategory); // POST /api/categories
router.post("/add-subcategory", addSubcategory); // POST /api/categories/add-subcategory
router.get("/", getAllCategories); // GET /api/categories
router.get("/subcategories", getSubcategoriesByCategory); // GET /api/categories/subcategories?category=electronic

module.exports = router;
