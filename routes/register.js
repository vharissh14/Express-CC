var express = require('express');
var router = express.Router();
const expressValidator = require('express-validator');
var passport = require('passport');
var lodash = require('lodash')

var bcrypt = require('bcrypt');
const saltRounds = 10;

router.get('/', function(req, res, next) {
  res.render('register', { title: 'User Registration' });
});

router.post('/', function(req, res, next) {

  var password = req.body.password;
  var user_info = lodash.omit(req.body, ['password', 'rpass']);

  req.check('pseudoname', 'Username must be at least 5 chars long and contain one number').isLength({ min: 5 });
  req.check('email', 'Must be an E-Mail').isEmail();
  req.check('password', 'passwords must be at least 5 chars long and contain one number').isLength({ min: 5 });

  const errors = req.validationErrors(req);
  if (errors) {
    console.log(errors);
    res.render('register', {title:'User Registration', errors:errors});
  }
  else{
    bcrypt.hash(password, saltRounds, function(err, hash) {
      user_info['hash'] = hash;
      require('../services/redisdb')(function (db1){
       db1.registerUser(user_info,function(status){
         if(status === '201')
         {
           res.redirect('/login');
         }
         else {
           res.render('register', {title:'User Registration', error_p:"Please enter a different pseudoname."});
         }
       });
     });

      // db.query('insert into users (pseudoname, email, password, phone, name) values (?, ?, ?, ?, ?)', [pseudoname, email, hash, phone, name],
      // function(error, result, field)
      // {
      //   if(error)
      //   {
      //     throw error;
      //   }
      //   else{
      //     console.log('The inserted id is: '+result.insertId);
      //     const user_id = result.insertId;
      //     req.login(user_id, function(err) {
      //       if(err)
      //       {
      //         throw error;
      //       }
      //       else {
      //         res.redirect('/');
      //       }
      //     });
      //     // res.redirect('/');
      //   }
      // });
    });
  }
  // res.render('register', { title: 'User Registration' });
});

passport.serializeUser(function(user_id, done) {
  done(null, user_id);
});

passport.deserializeUser(function(user_id, done) {
  done(null, user_id);
});

module.exports = router;
