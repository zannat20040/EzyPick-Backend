const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Address = require('./address');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
      maxlength: [100, 'Email cannot exceed 100 characters'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
    },
    role: {
      type: String,
      enum: ['buyer', 'seller', 'admin'],
      default: 'buyer',
    },
    address: [Address.schema],  // Reference to the Address model
    phoneNumber: {
      type: String,
      validate: {
        validator: function (v) {
          return /^\d{10,15}$/.test(v);
        },
        message: 'Please enter a valid phone number.',
      },
    },
    photo: String,
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    cart: [{
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: { type: Number, required: true, min: 1 }
    }],
    orders: [{
      orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
      status: { type: String, enum: ['pending', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
      totalAmount: { type: Number, required: true }
    }],
    totalSell: { type: Number, default: 0 },
    totalEarn: { type: Number, default: 0 },
    totalExpense: { type: Number, default: 0 },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);



// Hash the password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});



module.exports = mongoose.model('User', UserSchema);
