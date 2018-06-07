let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let Message = new Schema({
  room: {
    type: String,
    trim: true,
    required: true
  },
  text: {
    type: String,
    trim: true,
    required: true
  },
  forUsers: {
    type: [String],
    default: [],
  },
  sentBy: {
    type: String,
    required: true,
  },
  seenBy: {
    type: [String],
    default: []
  },
  deliveredTo: {
    type: [String],
    default: []
  },
  sensitive: {
    type: Boolean,
    default: false,
  },
  timestamp: {
    type: Number, // This is the timestamp the frontend generates
  },
  createdAt: {
    type: Date,
    default: Date.now // This is the time the message was inserted into the DB
  },
});

module.exports = mongoose.model('Message', Message);