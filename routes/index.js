const express = require('express');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const router = express.Router();

// Only allow unauthenticated users to access the login/signup pages
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        res.redirect('/people/' + req.user.username);
    } else {
        return next();
    }
}

router.get('/', checkAuthenticated, function(req, res, next) {
    res.render('index', { errorMessage: req.flash('error') });
});

router.post('/signup', checkAuthenticated, async (req, res, next) => {
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

router.post('/check-username', checkAuthenticated, async (req, res, next) => {
    const userExists = await User.findOne({ username: req.body.username }).exec();
    if (userExists) {
        return res.status(200).json({ signupErrorMessage: "Username is taken" });
    } else {
        return res.status(200).json({ signupErrorMessage: "" });
    }
});

router.post('/login', checkAuthenticated, (req, res, next) => {passport.authenticate('local', {
    successRedirect: '/people/' + req.body.username,
    failureRedirect: '/',
    failureFlash: true
})(req, res, next)});

function generateGuest(req, res, next) {
    return next();
}

router.post('/guest-login', checkAuthenticated, generateGuest, (req, res, next) => {passport.authenticate('local', {
    successRedirect: '/people/' + req.body.username,
    failureRedirect: '/',
    failureFlash: true
})(req, res, next)});

router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect("/");
    });
});

module.exports = router;
