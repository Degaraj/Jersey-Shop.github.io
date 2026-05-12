const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  plan_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Plan",
    required: true
  },
  payment_screenshot: String,

  payment_status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending"
  },

  payment_amount: Number,
  payment_method: {
    type: String,
    default: "Binance Pay"
  },

  uploaded_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  admin_verified_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  verified_at: Date,
  rejection_reason: String,

  subscription_start: Date,
  subscription_expiry: Date
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);