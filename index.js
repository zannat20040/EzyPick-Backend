require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const connectDB = require("./config/db");
const PORT = process.env.PORT || 5000;
const userRoutes = require("./routes/userRoutes");
const deliveryOptionRoutes = require("./routes/deliveryOptionRoutes");

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET,POST,PUT,DELETE,PATCH",
    allowedHeaders: "Content-Type,Authorization",
  })
);

// Use user routes
app.use("/api/users", userRoutes);
app.use("/api", deliveryOptionRoutes);

// Connect to MongoDB and start server
const startServer = async () => {
  await connectDB();

  app.get("/", (req, res) => {
    res.send("Hello World!");
  });

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();
