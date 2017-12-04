let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let passportLocalMongoose = require('passport-local-mongoose');

let User = new Schema({
  username: {type: String, trim: true, index: { unique: true }},
  password: String,
  icon: String,
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);
