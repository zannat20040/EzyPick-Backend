const mongoose = require("mongoose");

const deliveryOptionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
}, { timestamps: true });

module.exports = mongoose.models.DeliveryOption || mongoose.model("DeliveryOption", deliveryOptionSchema);
