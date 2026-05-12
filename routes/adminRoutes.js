const express = require("express");
const router = express.Router();

const Payment = require("../models/Payment");
const User = require("../models/User");
const Prediction = require("../models/Prediction");
const Feedback = require("../models/Feedback");

const { isAdmin } = require("../middleware/auth");

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

router.get("/dashboard", isAdmin, async (req, res) => {
  const payments = await Payment.find()
    .populate("user_id")
    .populate("plan_id")
    .sort({ createdAt: -1 });

  const totalUsers = await User.countDocuments({ role: "user" });
  const paidUsers = await User.countDocuments({ subscriptionStatus: "Active" });
  const pendingPayments = await Payment.countDocuments({ payment_status: "Pending" });
  const approvedPayments = await Payment.countDocuments({ payment_status: "Approved" });
  const rejectedPayments = await Payment.countDocuments({ payment_status: "Rejected" });
  const totalPredictions = await Prediction.countDocuments();
  const totalFeedback = await Feedback.countDocuments();

  const { totalFinished, totalCorrect, winRate } = await getPredictionStats();

  res.render("admin-dashboard", {
    admin: req.session.user,
    payments,
    stats: {
      totalUsers,
      paidUsers,
      pendingPayments,
      approvedPayments,
      rejectedPayments,
      totalPredictions,
      totalFeedback,
      totalFinished,
      totalCorrect,
      winRate
    }
  });
});

router.post("/approve/:id", isAdmin, async (req, res) => {
  const payment = await Payment.findById(req.params.id)
    .populate("plan_id")
    .populate("user_id");

  const startDate = new Date();
  const expiryDate = new Date();

  expiryDate.setDate(startDate.getDate() + payment.plan_id.durationDays);

  payment.payment_status = "Approved";
  payment.verified_at = new Date();
  payment.admin_verified_by = req.session.user._id;
  payment.subscription_start = startDate;
  payment.subscription_expiry = expiryDate;

  await payment.save();

  await User.findByIdAndUpdate(payment.user_id._id, {
    subscriptionStatus: "Active",
    subscriptionStart: startDate,
    subscriptionExpiry: expiryDate
  });

  res.redirect("/admin/dashboard");
});

router.post("/reject/:id", isAdmin, async (req, res) => {
  await Payment.findByIdAndUpdate(req.params.id, {
    payment_status: "Rejected",
    rejection_reason: req.body.rejection_reason,
    verified_at: new Date(),
    admin_verified_by: req.session.user._id
  });

  res.redirect("/admin/dashboard");
});

router.post("/delete/:id", isAdmin, async (req, res) => {
  await Payment.findByIdAndDelete(req.params.id);
  res.redirect("/admin/dashboard");
});

router.get("/predictions", isAdmin, async (req, res) => {
  const predictions = await Prediction.find().sort({ createdAt: -1 });

  res.render("admin-predictions", {
    admin: req.session.user,
    predictions
  });
});

router.post("/predictions/add", isAdmin, async (req, res) => {
  const {
    matchName,
    league,
    matchDate,
    predictedWinner,
    predictedScore,
    category,
    analysis
  } = req.body;

  await Prediction.create({
    matchName,
    league,
    matchDate,
    predictedWinner,
    predictedScore,
    category,
    analysis,
    createdBy: req.session.user._id
  });

  res.redirect("/admin/predictions");
});

router.post("/predictions/result/:id", isAdmin, async (req, res) => {
  await Prediction.findByIdAndUpdate(req.params.id, {
    resultStatus: req.body.resultStatus
  });

  res.redirect("/admin/predictions");
});

router.post("/predictions/delete/:id", isAdmin, async (req, res) => {
  await Prediction.findByIdAndDelete(req.params.id);
  res.redirect("/admin/predictions");
});

module.exports = router;
