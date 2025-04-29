const axios = require("axios");
require("dotenv").config();

async function setFilterableAttributes() {
  try {
    await axios.put(
      `${process.env.MEILISEARCH_HOST}/indexes/products/settings/filterable-attributes`,
      [
        "category",
        "subcategory"
      ],
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.MEILISEARCH_API_KEY}`, // ✅ IMPORTANT
        },
      }
    );

    console.log("✅ Filterable attributes set successfully!");
  } catch (error) {
    console.error(
      "❌ Error setting filterable attributes:",
      error.response?.data || error.message
    );
  }
}

setFilterableAttributes();
