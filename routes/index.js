let express = require('express');
let router = express.Router();

let passport = require('passport');
let User = require('../models/user');
let Room = require('../models/room');
let Message = require('../models/message');
let bCrypt = require('bcrypt-nodejs');
let jwt = require('jsonwebtoken');
let expressWs = require('express-ws')(router);


router.get('/', function (req, res) {
  res.render('index', { user : req.user });
});

router.post('/register', function(req, res) {
  User.register(new User({ username : req.body.username }), req.body.password, function(err, user) {
    if (err) {
      res.status(401);
      res.send({success: false});
      console.log(err);
    }

    passport.authenticate('local')(req, res, () => {
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
    let token = jwt.sign({
      id: user.id,
      username: req.body.username
    }, 'tokenSecret');

    res.status(200);
    return res.json({
      success: true,
      token: token,
      user,
      id: user.id,
    });

  })(req, res, next);

});

router.post("/users", passport.authenticate('jwt'),(req, res) => {
  User.find({}, (err, users) => {
    let userMap = [];

    users.forEach((user) => {
      userMap.push(user);
    });

    res.json(userMap);
  });
});

function sendResponse(err, roomMap, res) {
  res.json(roomMap)
}

router.post("/rooms", passport.authenticate('jwt'), (req, res) => {
  Room.find({users: req.body.userId}, (err, rooms) => {
    let roomMap = [];

    let ctr = 0;

    rooms.forEach((room) => {

      // If the room doesn't have a name, set a default one
      if (!room.name || room.name.length === 0) {
        User.find({_id: room.users}, (err, users) => {
          users.forEach((user) => {
            if (!room.name) room.name = '';
            room.name += user.username + ", ";
          });
          ctr++; 
          roomMap.push(room);
          if (ctr === rooms.length) {
            sendResponse(err, roomMap, res);
          }
        });
      } else {
        ctr++; 
        roomMap.push(room);
        if (ctr === rooms.length) {
          sendResponse(err, roomMap, res);
        }
      }
    });
  });
});

router.post("/chats", passport.authenticate('jwt'), (req, res) => {
  Room.find({users: req.body.userId}).sort({lastMessageTime: -1}).exec((err, rooms) => {
    let roomMap = [];

    let ctr = 0;

    rooms.forEach((room) => {
      // If the room doesn't have a name, set a default one
      if (!room.name || room.name.length === 0) {
        User.find({_id: room.users}, (err, users) => {
          users.forEach((user) => {
            if (!room.name) room.name = '';
            room.name += user.username + ", ";
          });
          ctr++; 
          roomMap.push(room);
          if (ctr === rooms.length) {
            sendResponse(err, roomMap, res);
          }
        });
      } else {
        ctr++; 
        roomMap.push(room);
        if (ctr === rooms.length) {
          sendResponse(err, roomMap, res);
        }
      }
    });
  });
});

router.post("/messages", passport.authenticate('jwt'), function(req, res){
  Message.find({ $query: {room: req.body.room}, $orderby: { createdAt : 1 } }, { originalText: 0 }, function(err, messages) {
    if (err) {
      return res.send(err);
    }

    let messageMap = [];

    messages.forEach(function(message) {
      messageMap.push(message);
    });

    res.json(messageMap);
  });
});


router.post("/messages-sensitive", passport.authenticate('jwt'), function(req, res){
  if (req.body.pin != '1234') {
    res.error();
    return;
  }

  Message.find({ $query: {room: req.body.room}, $orderby: { createdAt : 1 } }, function(err, messages) {
    if (err) {
      return res.send(err);
    }

    let messageMap = [];

    messages.forEach(function(message) {
      if (message.originalText) {
        message.text = message.originalText;
      }

      messageMap.push(message);
    });

    res.json(messageMap);
  });
});


router.post("/last-online", passport.authenticate('jwt'), function(req, res) {
  User.update(
    { _id: req.body.userId }, 
    { lastOnline: Date.now() },
    (err, raw) => {
      if (err) {
        return res.send(err);
      }

      return res.json({success: true})
    }
  );
});

router.get("/last-online", passport.authenticate('jwt'), function(req, res) {
  User.findOne(
    { _id: req.query.id },
    (err, user) => {
      if (err) {
        return res.send(err);
      }
      
      return res.json({
        success: true,
        lastOnline: user.lastOnline,
      })
    }
  );
});

router.post("/message-delivered", passport.authenticate('jwt'), function(req, res){
  console.log(req.body);
  console.log('ddddddddddddddddddddddddddddddddddddd');
  Message.update(
    { _id: req.body.message._id }, 
    { $push: { deliveredTo: req.body.userId } },
    (err, message) => {
      if (err) {
        return res.send(err);
      }
      Room.update(
        { _id: req.body.message.room }, 
        { $push: { deliveredTo: req.body.userId } },
        (err, room) => {
          if (err) {
            return res.send(err);
          }
          console.log(room);
          return res.json({success: true})
        }
      );
    }
  );
});

router.post("/message-seen", passport.authenticate('jwt'), function(req, res){
  console.log(req.body);
  console.log('eeeeeeeeeeeeeeee');
  Message.update(
    { _id: req.body.message._id }, 
    { $push: { seenBy: req.body.userId } },
    (err, message) => {
      if (err) {
        return res.send(err);
      }

      // Room.update(
      //   { _id: req.body.message.room }, 
      //   { $push: { seenBy: req.body.userId } },
      //   (err, message) => {
      //     if (err) {
      //       return res.send(err);
      //     }
      //     return res.json({success: true})
      //   }
      // );
    }
  );
});

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

router.get('/ping', function(req, res){
  res.status(200).send("pong!");
});



module.exports = router;

