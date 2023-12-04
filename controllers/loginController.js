const asyncHandler = require("express-async-handler");
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const passport = require('passport');

// Display login/signup page
exports.index = asyncHandler(async (req, res, next) => {
    res.render("login", { errorMessage: req.flash('error') });
});

// Create a new user in the database with a hashed password
exports.signup = asyncHandler(async (req, res, next) => {
    bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
        try {
            const user = new User({
                username: req.body.username,
                password: hashedPassword,
                firstname: req.body.firstname,
                lastname: req.body.lastname
            });
            await user.save();
            res.redirect("/");
        } catch(err) {
            return next(err);
        };
    });
});

// Check if an username already exists in the database
exports.checkUsername = asyncHandler(async (req, res, next) => {
    const userExists = await User.findOne({ username: req.body.username }).exec();
    if (userExists) {
        return res.status(200).json({ signupErrorMessage: "Username is taken" });
    } else {
        return res.status(200).json({ signupErrorMessage: "" });
    }
});

// Log user in and create a browser session
exports.login = asyncHandler(async (req, res, next) => {
    passport.authenticate('local', {
    successRedirect: '/people/' + req.body.username,
    failureRedirect: '/',
    failureFlash: true
    })
    (req, res, next)
});

// Log guest user in and create a browser session
exports.guestLogin = asyncHandler(async (req, res, next) => {
    passport.authenticate('local', {
    successRedirect: '/people/' + req.body.username,
    failureRedirect: '/',
    failureFlash: true
    })
    (req, res, next)
});

// Log user out and redirect to login/signup page
exports.logout = asyncHandler(async (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect("/");
    });
});