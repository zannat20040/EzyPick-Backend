require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const deliveryOptionRoutes = require("./routes/deliveryOptionRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const aiRoutes = require("./routes/aiRoutes");

app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://next-ezypick.vercel.app/",
      "https://ms-fc8c86cde65a-22389.nyc.meilisearch.io", // Meilisearch cloud URL
    ],
    methods: "GET,POST,PUT,DELETE,PATCH",
    allowedHeaders: "Content-Type,Authorization",
  })
);

// Use routes
app.use("/api/users", userRoutes);
app.use("/api", deliveryOptionRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/product", productRoutes);
app.use("/api/user-cart", cartRoutes);
app.use("/api", orderRoutes);
app.use("/api", reviewRoutes);
app.use("/api/products", aiRoutes);

// Root route to show a message
app.get("/", (req, res) => {
  res.send("Welcome to the API! The server is running successfully.");
});
// Connect to MongoDB
connectDB();

// Start the server for local development
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000; // Default to 5000 if PORT is not set
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// For Vercel, export the app instead of using app.listen()
module.exports = app;
