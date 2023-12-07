const createError = require('http-errors');
const express = require('express');
const path = require('path');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
require('dotenv').config();

// Set up mongoose for mongoDB queries
const mongoose = require("mongoose");
const initializeMongoose = require('./mongoose-config');
initializeMongoose(mongoose);

// Set up passport for user authentication and persistence
const session = require("express-session");
const passport = require('passport');
const initializePassport = require('./passport-config');
initializePassport(passport);

// Start server
const app = express();

// Set up views
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Set up necessary middleware
app.use(session({ secret: process.env.SESSION, resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Set up routers
const loginRouter = require('./routes/login');
const peopleRouter = require('./routes/people');
app.use('/', loginRouter);
app.use('/people', peopleRouter);

// Catch illegal route
app.use(function(req, res, next) {
    next(createError(404));
});

// Redirect all illegal routes back to root route
app.use(function(err, req, res, next) {
    res.redirect("/");
});

module.exports = app;