const Category = require("../models/category");

// 📥 Create or Add new category
const addCategory = async (req, res) => {
  const { category } = req.body;

  if (!category)
    return res.status(400).json({ message: "Category is required." });

  try {
    const exists = await Category.findOne({ category });
    if (exists)
      return res.status(409).json({ message: "Category already exists." });

    const newCat = new Category({ category });
    await newCat.save();
    res.status(201).json({ message: "Category added", data: newCat });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to add category", error: err.message });
  }
};

// 📥 Add new subcategory to existing category
const addSubcategory = async (req, res) => {
  const { category, title } = req.body;
  if (!category || !title) {
    return res
      .status(400)
      .json({ message: "Both category and subcategory are required." });
  }

  try {
    const cat = await Category.findOne({ category });
    if (!cat) return res.status(404).json({ message: "Category not found" });

    if (cat.subcategory.includes(title)) {
      return res.status(409).json({ message: "Subcategory already exists." });
    }

    cat.subcategory.push(title);
    await cat.save();

    res.status(200).json({ message: "Subcategory added", data: cat });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to add subcategory", error: err.message });
  }
};

// 📤 Get all categories
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(  categories );
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch categories", error: err.message });
  }
};

// 📤 Get subcategories by category
const getSubcategoriesByCategory = async (req, res) => {
  const { category } = req.query;

  try {
    const cat = await Category.findOne({ category });
    if (!cat) return res.status(404).json({ message: "Category not found" });

    res.status(200).json({ data: cat.subcategory });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch subcategories", error: err.message });
  }
};

// ✅ Update only the thumbnail of a category by ID
const updateCategoryThumbnail = async (req, res) => {
  try {
    const { id } = req.params;
    const { thumbnail } = req.body;

    if (!thumbnail) {
      return res.status(400).json({ message: "Thumbnail is required." });
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { thumbnail },
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found." });
    }

    res.status(200).json({
      message: "Thumbnail updated successfully.",
      category: updatedCategory
    });
  } catch (error) {
    console.error("Error updating category thumbnail:", error);
    res.status(500).json({ message: "Server error." });
  }
};


module.exports = {
  addCategory,
  addSubcategory,
  getAllCategories,
  getSubcategoriesByCategory,
  updateCategoryThumbnail
};
