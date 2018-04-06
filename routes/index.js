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

router.get('/home', authenticationMiddleware(), function(req, res, next) {
  var cookie = req.session.passport;
  res.render('Home',
  {
    title: 'Home Page',
    email: cookie.user.email,
    pseudoname: cookie.user.pseudoname,
    name: cookie.user.name,
    teams: cookie.user.teams,
    auth: req.isAuthenticated()
  });
});

router.post('/team', function(req, res, next){

  var team = req.body;
  team.id=require('uuid/v4')();
  // validation
  require('../services/redisdb')(function (db1){
    db1.saveTeam(team, function(result){
      var teams=[];
      if (result) {
        Object.keys(result).forEach(key => {
          var objson=JSON.parse(result[key]);
          teams.push(objson);
        });
      }
      res.render('register', { title: 'User Registration', teamdetails: teams });
    });
  });

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
  successRedirect: '/home',
  failureRedirect: '/login',
  failureFlash: true
}));

function authenticationMiddleware() {
  return (req, res, next) => {
    if(req.isAuthenticated()) return next();
    res.redirect('/');
  }
}

module.exports = router;
