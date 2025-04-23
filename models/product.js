const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0, min: 0 },
  stock: { type: Number, required: true },
  offer: String,
  thumbnail: { type: String, required: true }, // stores the file ID or URL
  gallery: [String], // array of file IDs or URLs
  delivery_options: [String],
  category: {
    title: { type: String, required: true },
    subcategory: { type: String, required: true }
  },
  specifications: mongoose.Schema.Types.Mixed, 
  postedBy: { type: String, required: true } 
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
