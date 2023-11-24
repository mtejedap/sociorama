const express = require('express');
const passport = require('passport');
const router = express.Router();

router.get('/', function(req, res, next) {
    res.render('index', { user: req.user });
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/'
}));

router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect("/");
    });
});

module.exports = router;
