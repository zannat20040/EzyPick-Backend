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
    } = req.body;

    if (
      !name ||
      !price ||
      !stock ||
      !thumbnail ||
      !category?.title ||
      !category?.subcategory ||
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
        offer: { $ne: "" } 
      });
      res.status(200).json(products);
    } catch (err) {
      console.error("Error fetching offer products:", err);
      res.status(500).json({ message: "Server error" });
    }
  };


module.exports = { addNewProduct , getProductsWithOffers};
