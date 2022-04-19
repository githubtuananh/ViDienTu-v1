const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {type: String, require: true, unique: true},
  name: {type: String, require: true},
  phone: {type: String, require: true, unique: true},
  birthday: {type: String, require: true},
  address: {type: String, require: true},
  cmnd: {type: [String], require: true},
  username: {type:String, required: true, unique: true},
  password: {type:String, required: true},
  status: {type: String, default: "chờ xác minh"},
  firstLogin : {type: Boolean, default: true},
  createdAt: {type: Date, default: Date.now},
});

module.exports = mongoose.model("user", userSchema);
