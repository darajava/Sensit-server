let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let Room = new Schema({
  _id: {type: String, trim: true, index: { unique: true }},
  users: [String],
  name: String,
  autogenerated: Boolean,
  lastMessage: {type: String, default: "New chat"},
  lastMessageTime: {type: Date, default: Date.now},
  createdAt: { type: Date, default: Date.now },
  icon: String,
});

module.exports = mongoose.model('Room', Room);