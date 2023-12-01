const createError = require('http-errors');
const express = require('express');
const path = require('path');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
require('dotenv').config();

// Set up mongoose for mongoDB data handling

const mongoose = require("mongoose");
const initializeMongoose = require('./mongoose-config');
initializeMongoose(mongoose);

// Set up passport for user authentication and persistence

const session = require("express-session");
const passport = require('passport');
const initializePassport = require('./passport-config');
initializePassport(passport);

// Set up routers

const loginRouter = require('./routes/login');
const peopleRouter = require('./routes/people');

// Start express

const app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(session({ secret: process.env.SESSION, resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Use routers

app.use('/', loginRouter);
app.use('/people', peopleRouter);

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