const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const lockUserSchema = new Schema({
  username: {type:String, required: true, unique: true},
  createdAt: {type: Date, expires: 60, default: Date.now},
});

module.exports = mongoose.model("lockUser", lockUserSchema);
