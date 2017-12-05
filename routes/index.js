var express = require('express');
var router = express.Router();

var passport = require('passport');
var User = require('../models/user');
var Message = require('../models/message');
var router = express.Router();
var bCrypt = require('bcrypt-nodejs');
var jwt = require('jsonwebtoken');
var expressWs = require('express-ws')(router);


router.get('/', function (req, res) {
  res.render('index', { user : req.user });
});

router.post('/register', function(req, res) {
  User.register(new User({ username : req.body.username }), req.body.password, function(err, user) {
    if (err) {
      res.status(401);
      res.send({success: false});
    }

    passport.authenticate('local')(req, res, function () {
      res.status(200);
      res.send({success: true});
    });
  });
});

router.get('/login', function(req, res) {
  res.render('login', { user : req.user });
});

router.post('/login', function(req, res, next) {

  // generate the authenticate method and pass the req/res
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return next(err);
    }

    if (!user) {
      res.status(401);
      return res.send({ success: false, error: 'User not found' });
    }

    // XXX: update secret
    var token = jwt.sign({
      id: user.id,
      username: req.body.username
    }, 'tokenSecret');

    res.status(200);
    return res.json({
      success: true,
      token: token,
      id: user.id,
    });

  })(req, res, next);

});

router.post("/chats", passport.authenticate('jwt'), function(req, res){
  User.find({}, function(err, users) {
    var userMap = [];

    users.forEach(function(user) {
      userMap.push(user);
    });

    res.json(userMap);  
  });
});

router.post("/messages", passport.authenticate('jwt'), function(req, res){
  console.log(req.body);
  Message.find({ $query: {room: req.body.room}, $orderby: { createdAt : 1 } }, function(err, messages) {
    var messageMap = [];

    messages.forEach(function(message) {
      messageMap.push(message);
    });

    console.log(messageMap);

    res.json(messageMap);  
  });
});

router.post("/message-delivered", passport.authenticate('jwt'), function(req, res){
  console.log(req.body);
  Message.update(
    { _id: req.body.message._id }, 
    { $push: { deliveredTo: req.body.userId } },
    (err, message) => {
      if (err) {
        res.send(err);
      }
      res.json({success: true})
    }
  );
});

router.post("/message-read", passport.authenticate('jwt'), function(req, res){
  console.log(req.body);
  Message.find({ $query: {room: req.body.room}, $orderby: { createdAt : 1 } }, function(err, messages) {
    var messageMap = [];

    messages.forEach(function(message) {
      messageMap.push(message);
    });

    console.log(messageMap);

    res.json(messageMap);  
  });
});

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

router.get('/ping', function(req, res){
  res.status(200).send("pong!");
});



module.exports = router;

