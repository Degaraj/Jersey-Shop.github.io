const mongoose = require("mongoose");

const predictionSchema = new mongoose.Schema({
  matchName: String,
  league: String,
  matchDate: Date,
  predictedWinner: String,
  predictedScore: String,

  category: {
    type: String,
    enum: ["Free Prediction", "Premium Prediction", "High Confidence Pick", "Risky Pick", "VIP Pick"],
    default: "Premium Prediction"
  },

  resultStatus: {
    type: String,
    enum: ["Pending Result", "Correct", "Wrong"],
    default: "Pending Result"
  },

  analysis: String,

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, { timestamps: true });

module.exports = mongoose.model("Prediction", predictionSchema);
