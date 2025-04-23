const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    unique: true,
  },
  subcategory: {
    type: [String],
    default: [],
    required: true,
  },
  thumbnail: {
    type: String,
    required: false, 
    default: "",      
  }
}, { timestamps: true });

module.exports = mongoose.models.Category || mongoose.model("Category", categorySchema);
