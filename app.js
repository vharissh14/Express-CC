var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var redis   = require("redis");

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const expressValidator = require('express-validator');
var bcrypt = require('bcrypt');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var redisStore = require('connect-redis')(session);
var client  = redis.createClient({host : 'localhost', port : 6379})
// client.auth('Apollo13');
var MySQLStore = require('express-mysql-session')(session);
var LocalStrategy = require('passport-local').Strategy;

var index = require('./routes/index');
var users = require('./routes/users');
var register = require('./routes/register');
var app = express();
var server=app.listen(5000);
var io = require('socket.io').listen(server);
require('dotenv').config();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var options = {
  host: 'localhost',
  port: 6379,
  client: client,
  ttl: 3600
};

var sessStore = new redisStore(options);

app.set('trust proxy', 1)
app.use(session({
  secret: 'fdfgcxvvf12',
  resave: false,
  store: sessStore,
  saveUninitialized: false
  // cookie: { maxAge: 90000 }
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use('/', index);
app.use('/users', users);
app.use('/register', register);

require('./controllers/mapsocket')(function (callback){
  callback.socketio(io,{
  });
});
passport.use(new LocalStrategy({ passReqToCallback: true },
  function(req, username, password, done) {
    require('./services/redisdb')(function (db1){
      db1.userAuthentication(username, password, function(status){
        if(status=='401'){
          done(null, false, {'message': 'Please check Pseudoname/Password'});
        }
        else{
          done(null, {name: status.name, pseudoname: status.pseudoname, email: status.email, phone: status.phone, teams: status.teams, eventname: req.body.eventname});
        }
      });
    });
  }
));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


// Handlebars default config
const hbs = require('hbs');
const fs = require('fs');

const partialsDir = __dirname + '/views/partials';

const filenames = fs.readdirSync(partialsDir);

filenames.forEach(function (filename) {
  const matches = /^([^.]+).hbs$/.exec(filename);
  if (!matches) {
    return;
  }
  const name = matches[1];
  const template = fs.readFileSync(partialsDir + '/' + filename, 'utf8');
  hbs.registerPartial(name, template);
});

hbs.registerHelper('json', function(context) {
  return JSON.stringify(context, null, 2);
});


module.exports = app;
