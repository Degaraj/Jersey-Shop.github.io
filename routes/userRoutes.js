const express = require("express");
const router = express.Router();

const Plan = require("../models/Plan");
const Payment = require("../models/Payment");
const User = require("../models/User");
const Prediction = require("../models/Prediction");
const Feedback = require("../models/Feedback");

const upload = require("../middleware/upload");
const { isLoggedIn } = require("../middleware/auth");

async function getPredictionStats() {
  const totalFinished = await Prediction.countDocuments({
    resultStatus: { $in: ["Correct", "Wrong"] }
  });

  const totalCorrect = await Prediction.countDocuments({
    resultStatus: "Correct"
  });

  const winRate = totalFinished > 0
    ? Math.round((totalCorrect / totalFinished) * 100)
    : 0;

  return { totalFinished, totalCorrect, winRate };
}

router.get("/dashboard", isLoggedIn, async (req, res) => {
  const user = await User.findById(req.session.user._id);

  const latestPayment = await Payment.findOne({
    user_id: user._id
  }).populate("plan_id").sort({ createdAt: -1 });

  const payments = await Payment.find({
    user_id: user._id
  }).populate("plan_id").sort({ createdAt: -1 });

  const predictionCount = await Prediction.countDocuments();

  const isPaidUser =
    user.subscriptionStatus === "Active" &&
    user.subscriptionExpiry &&
    new Date(user.subscriptionExpiry) > new Date();

  const { totalFinished, totalCorrect, winRate } = await getPredictionStats();

  res.render("user-dashboard", {
    user,
    payment: latestPayment,
    payments,
    predictionCount,
    isPaidUser,
    totalFinished,
    totalCorrect,
    winRate
  });
});

router.get("/payment", isLoggedIn, async (req, res) => {
  const plans = await Plan.find();

  res.render("payment", {
    user: req.session.user,
    plans,
    wallet: process.env.BINANCE_WALLET
  });
});

router.post("/payment", isLoggedIn, upload.single("payment_screenshot"), async (req, res) => {
  const { plan_id } = req.body;

  const plan = await Plan.findById(plan_id);

  const duplicate = await Payment.findOne({
    user_id: req.session.user._id,
    payment_status: "Pending"
  });

  if (duplicate) {
    return res.send("You already have a pending payment request.");
  }

  await Payment.create({
    user_id: req.session.user._id,
    plan_id: plan._id,
    payment_screenshot: "/uploads/payment_proofs/" + req.file.filename,
    payment_status: "Pending",
    payment_amount: plan.price,
    payment_method: "Binance Pay",
    uploaded_by: req.session.user._id
  });

  res.redirect("/user/dashboard");
});

router.get("/predictions", isLoggedIn, async (req, res) => {
  const user = await User.findById(req.session.user._id);

  const predictions = await Prediction.find().sort({ createdAt: -1 });

  const feedbacks = await Feedback.find()
    .populate("user_id")
    .sort({ createdAt: -1 });

  const isPaidUser =
    user.subscriptionStatus === "Active" &&
    user.subscriptionExpiry &&
    new Date(user.subscriptionExpiry) > new Date();

  const { totalFinished, totalCorrect, winRate } = await getPredictionStats();

  res.render("user-predictions", {
    user,
    predictions,
    feedbacks,
    isPaidUser,
    totalFinished,
    totalCorrect,
    winRate
  });
});

router.post("/feedback/add", isLoggedIn, async (req, res) => {
  const user = await User.findById(req.session.user._id);

  const isPaidUser =
    user.subscriptionStatus === "Active" &&
    user.subscriptionExpiry &&
    new Date(user.subscriptionExpiry) > new Date();

  if (!isPaidUser) {
    return res.send("Only paid users can give feedback.");
  }

  await Feedback.create({
    user_id: user._id,
    rating: req.body.rating,
    message: req.body.message
  });

  res.redirect("/user/predictions");
});

module.exports = router;
