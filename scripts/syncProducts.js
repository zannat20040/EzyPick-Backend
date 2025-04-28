const mongoose = require("mongoose");
const axios = require("axios");
require("dotenv").config();
const Product = require("../models/product"); // Correct path to your Product model

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hdmaj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

async function syncProducts() {
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");

    // 2. Fetch Products from MongoDB
    const products = await Product.find({});
    console.log(`✅ Found ${products.length} products.`);

    // 3. Prepare products for Meilisearch
    const formattedProducts = products.map((product) => ({
      id: product._id, 
      name: product.name,
      description: product.description,
      price: product.price,
      discount: product.discount,
      offer: product.offer,
      thumbnail: product.thumbnail,
      category: product.category?.title, // Just title (not full object)
      subcategory: product.category?.subcategory,
      sellerName: product.sellerName,
      rating: product.rating,
      reviews: product.reviews,
    }));

    // 4. Push products to Meilisearch
    await axios.post(
      `${process.env.MEILISEARCH_HOST}/indexes/products/documents`,
      formattedProducts,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Products synced to Meilisearch successfully!");
    process.exit();
  } catch (error) {
    console.error("❌ Error syncing products:", error.message);
    process.exit(1);
  }
}

syncProducts();
