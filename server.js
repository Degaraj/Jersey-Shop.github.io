const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/soccer_subscription";
const SESSION_SECRET = process.env.SESSION_SECRET || "default_secret_change_this";

if (!process.env.MONGO_URI) {
  console.warn("Warning: MONGO_URI is not set. Falling back to local MongoDB.");
}
if (!process.env.SESSION_SECRET) {
  console.warn("Warning: SESSION_SECRET is not set. Using insecure default secret.");
}

mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use("/", authRoutes);
app.use("/user", userRoutes);
app.use("/admin", adminRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});