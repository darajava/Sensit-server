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
  readBy: {
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
  createdAt: {
    type: Date,
    default: Date.now
  },
});

module.exports = mongoose.model('Message', Message);