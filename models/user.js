const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    phone: {
      type: String,
    },

    address: {
      type: String,
    },

    role: {
      type: String,
      enum: ["buyer", "seller"],
      required: true,
    },

    profile_img: {
      type: String,
      default: "",
    },

    company_name: {
      type: String,
    },
    company_logo: {
      type: String,
    },
    company_email: {
      type: String,
    },
    company_phone: {
      type: String,
    },
    company_address: {
      type: String,
    },
    documents: [
      {
        type: String,
      },
    ],
    verification_status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.User || mongoose.model("User", userSchema);

