let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let passportLocalMongoose = require('passport-local-mongoose');

let User = new Schema({
  username: {type: String, trim: true, index: { unique: true }},
  password: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastOnline: {
    type: Date,
    default: Date.now // Default this to now on user create
  },
  icon: String,
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);
