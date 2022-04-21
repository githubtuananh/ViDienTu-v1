const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const blacklistSchema = new Schema({
  username: {type:String, required: true, unique: true},
  createdAt: {type: Date, default: Date.now},
});

module.exports = mongoose.model("blacklist", blacklistSchema);
