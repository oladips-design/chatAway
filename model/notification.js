const mongoose = require("mongoose");

const notification = mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Notif", notification);
