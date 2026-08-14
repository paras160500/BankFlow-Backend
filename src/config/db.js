const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    mongoose.connect(process.env.MONGO_URI);
    console.log("Connected ✅");
  } catch (error) {
    console.log("❌ Error in connecting to DB : ", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
