var express = require('express');
var router = express.Router();
var passport = require('passport');
var flash = require('connect-flash');
/* GET home page. */
router.get('/', function(req, res, next) {
  // console.log("in the root page")
  console.log(req.user);
  console.log('Root page Authenticated: '+req.isAuthenticated());
  res.render('index', { title: 'Teamtracker', auth:req.isAuthenticated() });
});

router.get('/profile', authenticationMiddleware(), function(req, res, next) {
  // console.log("in the root page")
  var cookie = req.session.passport;
  res.render('profile', { title: 'Profile Page', email: cookie.user.email, pseudoname: cookie.user.pseudoname, name: cookie.user.name, auth: req.isAuthenticated() });
});

router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Login', errormsg: req.flash('error'), auth: req.isAuthenticated()});
});

router.get('/logout', function(req, res, next) {
  req.logout();
  req.session.destroy();
  res.redirect('/');
});

router.post('/login', passport.authenticate('local'
, {
  successRedirect: '/profile',
  failureRedirect: '/login',
  failureFlash: true
}));

function authenticationMiddleware() {
  return (req, res, next) => {
    console.log(JSON.stringify(req.session.passport));
    if(req.isAuthenticated()) return next();
    res.redirect('/');
  }
}

module.exports = router;
