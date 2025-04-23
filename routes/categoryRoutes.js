const express = require("express");
const router = express.Router();
const {
  addCategory,
  addSubcategory,
  getAllCategories,
  getSubcategoriesByCategory,
  updateCategoryThumbnail,
} = require("../controllers/categoryController");

router.post("/", addCategory);
router.post("/add-subcategory", addSubcategory); 
router.get("/", getAllCategories); 
router.get("/subcategories", getSubcategoriesByCategory); 
router.put("/:id/thumbnail", updateCategoryThumbnail)
module.exports = router;
