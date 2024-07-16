require("dotenv").config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const githubRouter = require('./middleware/github-auth');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var projectRouter=require('./routes/project');
const passport = require('passport')
const cors = require('cors'); // Import the cors package
const session = require('express-session');
const { Sequelize, DataTypes } = require('sequelize');

var app = express();

const sequelize = new Sequelize('autodevops', 'admin', 'admin123', {
  host: process.env.DB_HOST,
  dialect: 'mysql'
});

// Enable CORS for specific origins
app.use(cors({
  origin: '*'
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET,
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, cb) {
  cb(null, user);
});
passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth/github', githubRouter);
app.use('/project',projectRouter);

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