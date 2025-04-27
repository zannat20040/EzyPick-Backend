const Product = require("../models/product");

const addNewProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      discount,
      stock,
      offer,
      thumbnail,
      gallery,
      delivery_options,
      category,
      specifications,
      postedBy,
      sellerName,
    } = req.body;

    if (
      !name ||
      !price ||
      !stock ||
      !thumbnail ||
      !category?.title ||
      !category?.subcategory ||
      !postedBy ||
      !sellerName ||
      !postedBy
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const product = new Product({
      name,
      description,
      price,
      discount,
      stock,
      offer,
      thumbnail,
      gallery,
      delivery_options,
      category,
      specifications,
      postedBy,
      sellerName,
    });

    await product.save();
    res.status(201).json({ message: "Product created successfully", product });
  } catch (err) {
    console.error("Error adding product:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getProductsWithOffers = async (req, res) => {
  try {
    const products = await Product.find({
      offer: { $ne: "" },
    });
    res.status(200).json(products);
  } catch (err) {
    console.error("Error fetching offer products:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("category"); // Optional: populate category details
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getSingleProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id).populate("category"); // optional populate
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching single product:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateFields,
      { new: true } // return the updated product
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getProductsByUser = async (req, res) => {
  try {
    const { email } = req.params;
    const products = await Product.find({ postedBy: email });
    res.status(200).json(products);
  } catch (err) {
    console.error("Error fetching user's products:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    const deleted = await Product.findByIdAndDelete(productId);

    if (!deleted) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getProductsByCategory = async (req, res) => {
  const { categoryName } = req.params;

  try {
    const products = await Product.find({ "category.title": categoryName });

    if (!products.length) {
      return res
        .status(404)
        .json({ message: "No products found for this category." });
    }

    res.status(200).json({ products });
  } catch (error) {
    console.error("Error fetching products by category:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  addNewProduct,
  getProductsWithOffers,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  getProductsByUser,
  deleteProduct,
  getProductsByCategory,
};
