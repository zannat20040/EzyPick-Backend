const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
    maxlength: [100, 'Email cannot exceed 100 characters']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  role: {
    type: String,
    enum: ['buyer', 'seller', 'admin'], // role validation
    default: 'buyer'
  },
  address: {
    type: String,
    maxlength: [200, 'Address cannot exceed 200 characters']
  },
  number: {
    type: Number,
    validate: {
      validator: function (v) {
        return /^\d{11}$/.test(v); // basic 10-digit phone number validation
      },
      message: 'Please enter a valid 11-digit phone number'
    },
  },
  photo: {
    type: String,
  },
  totalSell: {
    type: Number,
    default: 0,
    min: [0, 'Total sell cannot be negative']
  },
  totalEarn: {
    type: Number,
    default: 0,
    min: [0, 'Total earnings cannot be negative']
  },
  totalExpense: {
    type: Number,
    default: 0,
    min: [0, 'Total expense cannot be negative']
  }
});

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
