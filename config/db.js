const mongoose = require("mongoose");
require("dotenv").config();


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hdmaj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// const uri = mongodb+srv://shanzidadisha1234:<db_password>@cluster0.hdmaj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
const clientOptions = {
  serverApi: { version: "1", strict: true, deprecationErrors: true },
};

const connectDB = async () => {
  try {
    await mongoose.connect(uri, clientOptions);
    console.log("Successfully connected to MongoDB!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit the process with failure
  }
};

module.exports = connectDB;
