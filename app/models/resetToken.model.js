const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const resetTokenSchema = new Schema({
  email: {type: String, require: true, unique: true},
  token: {type: String, require: true, unique: true},
  createdAt: {type: Date, expires: 60*10 ,default: Date.now},
});

module.exports = mongoose.model("resetToken", resetTokenSchema);
