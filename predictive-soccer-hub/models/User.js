const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true },
  password: String,
  avatar: {
    type: String,
    default: "/default-avatar.png"
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },
  subscriptionStatus: {
    type: String,
    enum: ["Inactive", "Active"],
    default: "Inactive"
  },
  subscriptionStart: Date,
  subscriptionExpiry: Date
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);