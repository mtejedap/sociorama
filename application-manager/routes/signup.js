const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const router = express.Router();

router.get('/', function(req, res, next) {
    res.render('signup', { title: 'Express' });
});

router.post('/', async (req, res, next) => {
    bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
        try {
            const user = new User({
              username: req.body.username,
              password: hashedPassword
            });
            const result = await user.save();
            res.redirect("/");
        } catch(err) {
            return next(err);
        };
    });
});

module.exports = router;
