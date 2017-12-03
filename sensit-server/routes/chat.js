var express = require('express');
var router = express.Router();

var express = require('express');
var passport = require('passport');
var User = require('../models/user');
var router = express.Router();
var bCrypt = require('bcrypt-nodejs');
var jwt = require('jsonwebtoken');


router.get('/', function(ws, req) {
  req.send('hello')
});


module.exports = router;
