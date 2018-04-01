var express = require('express');
var router = express.Router();
const expressValidator = require('express-validator');

var bcrypt = require('bcrypt');
const saltRounds = 10;

router.get('/', function(req, res, next) {
    res.render('register', { title: 'User Registration' });
});

router.post('/', function(req, res, next) {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;

    console.log(username+"  "+email)

    const db = require('../db');

    req.check('username', 'Username must be at least 5 chars long and contain one number').isLength({ min: 5 });
    req.check('email', 'Must be an E-Mail').isEmail();
    req.check('password', 'passwords must be at least 5 chars long and contain one number').isLength({ min: 5 });

    const errors = req.validationErrors(req);
    if (errors) {
        console.log(errors);
        res.render('register', {title:'Registration', errors:errors});
    }
    else{
        bcrypt.hash(password, saltRounds, function(err, hash) {
            db.query('insert into users (username, email, password) values (?, ?, ?)', [username, email, hash],
            function(error, result, field)
            {
                if(error)
                {
                    throw error;
                }
                else{
                    res.redirect('/');
                }
            });
        });
    }
    // res.render('register', { title: 'User Registration' });
});

module.exports = router;