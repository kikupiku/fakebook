let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let dotenv = require('dotenv');
let flash = require('connect-flash');
dotenv.config();
let passport = require('./passport');
let session = require('express-session');

let indexRouter = require('./routes/index');
let usersRouter = require('./routes/users');

const MONGODB_URI = process.env.MONGODB_SECRET;

let app = express();
let secretCode = process.env.SESSION_SECRET;
app.use(cookieParser());
app.use(session({ secret: secretCode , resave: false, saveUninitialized: true }));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

let mongoose = require('mongoose');
let mongoDB = MONGODB_URI;
mongoose.connect(mongoDB, { useUnifiedTopology: true, useNewUrlParser: true });
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error'));

app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  console.log('ERROR: ', err);

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
