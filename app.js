var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var https = require('https');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
import passport from 'passport';
import bodyParser from 'body-parser';
import session from 'express-session';

// Other configuration modules
import configurePassport from './config/passport';
import configureRoutes from './routes/index';

const shouldConfigureLocal = process.env.NODE_ENV === 'development';

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


// Parses payload bodies in requests so it is easier to work with
app.use(bodyParser.urlencoded({ extended: false }));

// Parses requests cookies. This is needed to get the user session cookie
app.use(cookieParser());

// Creates user session cookies that allows users to navigate between protected routes without
// having to log in every time
app.use(session({
secret: 'keyboard cat',
resave: false,
saveUninitialized: true,
}));

// Configure passport with SAML strategy
configurePassport(passport, false);

// Initialize passport and passport sessions
app.use(passport.initialize());
app.use(passport.session());


// Add routes to app
app.use(configureRoutes(passport));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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

module.exports = app;
