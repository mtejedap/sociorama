const express = require('express');
const loginController = require('../controllers/loginController');
const router = express.Router();

// Only allow unauthenticated users to access the login/signup page
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        res.redirect('/people/' + req.user.username);
    } else {
        return next();
    }
}

// GET request for displaying login/signup page
router.get('/', checkAuthenticated, loginController.index);

// POST request for creating a new user in the database
router.post('/signup', checkAuthenticated, loginController.signup);

// POST request for checking if an username already exists in the database
router.post('/check-username', checkAuthenticated, loginController.checkUsername);

// POST request for logging in and creating a browser session for the user
router.post('/login', checkAuthenticated, loginController.login);

// POST request for logging in a guest user for demo purposes
router.post('/guest-login', checkAuthenticated, loginController.guestLogin);

// GET request for logging an user out and redirecting to login/signup page
router.get('/logout', loginController.logout);

module.exports = router;
