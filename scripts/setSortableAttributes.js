const axios = require("axios");
require("dotenv").config();

async function setSortableAttributes() {
  try {
    await axios.put(
      `${process.env.MEILISEARCH_HOST}/indexes/products/settings/sortable-attributes`,
      [
        "price" // ✅ Make 'price' sortable
      ],
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Sortable attributes set successfully!");
  } catch (error) {
    console.error("❌ Error setting sortable attributes:", error.response?.data || error.message);
  }
}

setSortableAttributes();
