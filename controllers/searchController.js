const { default: axios } = require("axios");

// ✅ Get Reviews for a Product
const searchProducts = async (req, res) => {
  const { query } = req.body;

  try {
    const meiliResponse = await axios.post(
      `${process.env.MEILISEARCH_HOST}/indexes/products/search`,
      {
        q: query,
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.MEILISEARCH_API_KEY}`, // Add Authorization header with API key
          "Content-Type": "application/json", // Ensure content type is set to JSON
        },
      }
    );

    res.json(meiliResponse.data.hits);
  } catch (error) {
    console.error("Search error:", error.message);
    res.status(500).json({ error: "Search failed" });
  }
};

module.exports = {
  searchProducts,
};
