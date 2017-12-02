var express = require('express');
var router = express.Router();

var express = require('express');
var passport = require('passport');
var User = require('../models/user');
var router = express.Router();


router.get('/', function (req, res) {
    res.render('index', { user : req.user });
});

router.post('/register', function(req, res) {
    console.log(req.body);
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

router.post('/login', passport.authenticate('local'), function(req, res) {
    res.redirect('/');
});

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

router.get('/ping', function(req, res){
    res.status(200).send("pong!");
});

module.exports = router;

