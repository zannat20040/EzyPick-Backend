const { default: axios } = require("axios");

// ✅ Get Reviews for a Product
const searchProducts = async (req, res) => {
  const { query } = req.body;

  try {
    const response = await axios.post(
      `${process.env.MEILISEARCH_HOST}/indexes/products/search`,
      {
        q: query,
      }
    );

    res.json(response.data.hits);
  } catch (error) {
    console.error("Error searching products:", error.message);
    res.status(500).json({ error: "Search failed" });
  }
};

module.exports = {
  searchProducts,
};
