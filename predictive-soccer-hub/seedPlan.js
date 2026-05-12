const mongoose = require("mongoose");
const Plan = require("./models/Plan");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {

    await Plan.deleteMany();

    await Plan.insertMany([
      {
        name: "Monthly Plan",
        price: 10,
        durationDays: 30
      },
      {
        name: "Yearly Plan",
        price: 100,
        durationDays: 365
      }
    ]);

    console.log("Plans Added Successfully");
    process.exit();

  })
  .catch(err => console.log(err));

