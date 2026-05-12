const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();

router.get("/", (req, res) => {
  res.redirect("/login");
});

router.get("/register", (req, res) => {
  res.render("register");
});

router.post("/register", async (req, res) => {
  const { fullName, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  await User.create({
    fullName,
    email,
    password: hashedPassword
  });

  res.redirect("/login");
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) return res.send("Invalid email or password");

  const match = await bcrypt.compare(password, user.password);

  if (!match) return res.send("Invalid email or password");

  req.session.user = user;

  if (user.role === "admin") {
    return res.redirect("/admin/dashboard");
  }

  res.redirect("/user/dashboard");
});

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

module.exports = router;