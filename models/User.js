const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, default: "user" },

  resetToken: { type: String },          // for forgot password
  resetTokenExpire: { type: Date }       // token expiry time

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);