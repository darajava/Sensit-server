let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let Room = new Schema({
	_id: {type: String, trim: true, index: { unique: true }},
  users: [String],
  name: String,
  createdAt: { type: Date, default: Date.now },
  icon: String,
});

module.exports = mongoose.model('Room', Room);