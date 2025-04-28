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
    origin: "http://localhost:3000",  // You may need to update this URL for production
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

// Connect to MongoDB
connectDB();

// For Vercel, export the app instead of using app.listen()
module.exports = app;
