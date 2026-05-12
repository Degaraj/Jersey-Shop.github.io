const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  message: String
}, { timestamps: true });

module.exports = mongoose.model("Feedback", feedbackSchema);