const mongoose = require("mongoose");
require("dotenv").config();
const URI = process.env.DB;

const connectDB = async () => {
  try {
    let conn = await mongoose.connect(URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(`ERROR : ${error.message}`);
    process.exit();
  }
};

module.exports = connectDB;
