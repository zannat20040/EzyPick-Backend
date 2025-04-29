const Product = require("../models/product");
const axios = require("axios"); // ✅ Imported axios

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

    // ✅ NEW: Also push to Meilisearch
    await axios.post(
      `${process.env.MEILISEARCH_HOST}/indexes/products/documents`,
      [
        {
          id: product._id,
          name: product.name,
          description: product.description,
          price: product.price,
          discount: product.discount,
          thumbnail: product.thumbnail,
          category: product.category?.title,
          subcategory: product.category?.subcategory,
          sellerName: product.sellerName,
          rating: product.rating,
        },
      ],
      {
        headers: {
          Authorization: `Bearer ${process.env.MEILISEARCH_API_KEY}`, // ✅ Add this
        },
      }
    );

    res.status(201).json({ message: "Product created successfully", product });
  } catch (err) {
    console.error("Error adding product:", err);
    res.status(500).json({ message: error || "Server error" });
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

    const updatedProduct = await Product.findByIdAndUpdate(id, updateFields, {
      new: true,
    });

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // ✅ NEW: Also update Meilisearch
    await axios.post(
      `${process.env.MEILISEARCH_HOST}/indexes/products/documents`,
      [
        {
          id: updatedProduct._id,
          name: updatedProduct.name,
          description: updatedProduct.description,
          price: updatedProduct.price,
          discount: updatedProduct.discount,
          thumbnail: updatedProduct.thumbnail,
          category: updatedProduct.category?.title,
          subcategory: updatedProduct.category?.subcategory,
          sellerName: updatedProduct.sellerName,
          rating: updatedProduct.rating,
        },
      ],
      {
        headers: {
          Authorization: `Bearer ${process.env.MEILISEARCH_API_KEY}`, // ✅ Add this
        },
      }
    );

    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: error || "Server error" });
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

    // ✅ NEW: Also delete from Meilisearch
    await axios.delete(
      `${process.env.MEILISEARCH_HOST}/indexes/products/documents/${productId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MEILISEARCH_API_KEY}`,
        },
      }
    );

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: error || "Server error" });
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

const recommendProducts = async (req, res) => {
  const { category, subcategory, price, productId } = req.body;

  try {
    const filters = [];
    if (category) filters.push(`category = "${category}"`);
    if (subcategory) filters.push(`subcategory = "${subcategory}"`);

    const meiliResponse = await axios.post(
      `${process.env.MEILISEARCH_HOST}/indexes/products/search`,
      {
        filter: filters.length > 0 ? filters : undefined,
        limit: 50, // Fetch more products to sort properly
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.MEILISEARCH_API_KEY}`,
        },
      }
    );

    let recommended = meiliResponse.data.hits.filter((p) => p.id !== productId);

    // ✅ Smart sorting
    recommended = recommended.sort((a, b) => {
      if ((b.rating || 0) !== (a.rating || 0)) {
        return (b.rating || 0) - (a.rating || 0); // Higher rating first
      }
      if ((b.reviews || 0) !== (a.reviews || 0)) {
        return (b.reviews || 0) - (a.reviews || 0); // Higher reviews next
      }
      if ((b.discount || 0) !== (a.discount || 0)) {
        return (b.discount || 0) - (a.discount || 0); // Higher discount next
      }
      return 0;
    });

    // ✅ Price ±500 range
    recommended = recommended.filter((p) => Math.abs(p.price - price) <= 500);

    res.json(recommended.slice(0, 10)); // Top 10 recommendations
  } catch (error) {
    console.error(
      "Recommendation error:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Recommendation failed" });
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
  recommendProducts,
};
