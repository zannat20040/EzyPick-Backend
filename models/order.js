const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    products: [{
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      price: {
        type: Number,
        required: true,
      }
    }],
    status: {
      type: String,
      enum: ['pending', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    shippingAddress: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Address',
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'unpaid'],
      default: 'unpaid',
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', OrderSchema);
