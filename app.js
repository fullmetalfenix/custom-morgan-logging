var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');

var logger = require('morgan');
var rfs = require('rotating-file-stream')
var accessLogStream = rfs('access.log', {
  interval: '1d', // rotate daily
  path: path.join(__dirname, 'daily-logs')
})

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
 
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

var customVar = "Slug";
app.use(logger(function (tokens, req, res) {
  return [
    `DATE: ${tokens.date(req,res)}`,
    `METHOD: ${tokens.method(req, res)}`,
    `URL: ${tokens.url(req, res)}`,
    `STATUS: ${tokens.status(req, res)}`,
    `CONTENT LENGTH: ${tokens.res(req, res, 'content-length')}`,
    `USER AGENT: ${tokens['user-agent'](req, res)}`,
    `RESPONSE TIME: ${tokens['response-time'](req, res)}ms`,
    `${customVar}`
  ].join(' /***/ ')}, 
  { stream: accessLogStream }
));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

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
