const express = require('express');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const router = express.Router();

router.get('/', function(req, res, next) {
    res.render('index', { user: req.user });
});

router.get('/signup', function(req, res, next) {
    res.render('signup');
});

router.post('/signup', async (req, res, next) => {
    bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
        try {
            const userExists = await User.findOne({ username: req.body.username }).exec();
            if (userExists) {
                res.redirect("/signup");
                return;
            }
            const user = new User({
                username: req.body.username,
                password: hashedPassword,
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                gender: req.body.gender,
                dob: req.body.dob
            });
            const result = await user.save();
            res.redirect("/");
        } catch(err) {
            return next(err);
        };
    });
});

router.post('/login', (req, res, next) => {passport.authenticate('local', {
    successRedirect: '/people/' + req.body.username,
    failureRedirect: '/'
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
