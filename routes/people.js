const express = require('express');
const peopleController = require('../controllers/peopleController');
const router = express.Router();

// Only allow authenticated users to access URLs other than the login/signup page
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/');
    }
} 

// GET request for displaying user home page
router.get('/:userid', checkAuthenticated, peopleController.index);

// POST request for deleting an user
router.post('/:userid/delete', checkAuthenticated, peopleController.delete);

// GET request for displaying user profile page
router.get('/:userid/profile', checkAuthenticated, peopleController.profile);

// POST request for updating user profile picture
router.post('/:userid/update-pfp', checkAuthenticated, peopleController.updatePfp);

// GET request for sending friend request
router.get('/:userid/friend', checkAuthenticated, peopleController.sendFriendRequest);

// POST request for accepting friend request
router.post('/:userid/accept', checkAuthenticated, peopleController.acceptFriendRequest);

// POST request for rejecting friend request
router.post('/:userid/reject', checkAuthenticated, peopleController.rejectFriendRequest);

// GET request for removing friend
router.get('/:userid/unfriend', checkAuthenticated, peopleController.removeFriend);

// POST request for creating a post
router.post('/:userid/posts/create', checkAuthenticated, peopleController.postCreate);

// GET request for reading a post
router.get('/:userid/posts/:postid', checkAuthenticated, peopleController.postRead);

// POST request for updating a post
router.post('/:userid/posts/:postid/update', checkAuthenticated, peopleController.postUpdate);

// POST request for deleting a post
router.post('/:userid/posts/:postid/delete', checkAuthenticated, peopleController.postDelete);

// POST request for liking a post
router.post('/:userid/posts/:postid/like', checkAuthenticated, peopleController.likePost);

// POST request for creating a comment
router.post('/:userid/posts/:postid/comments/create', checkAuthenticated, peopleController.commentCreate);

// POST request for updating a comment
router.post('/:userid/posts/:postid/comments/:commentid/update', checkAuthenticated, peopleController.commentUpdate);

// POST request for deleting a comment
router.post('/:userid/posts/:postid/comments/:commentid/delete', checkAuthenticated, peopleController.commentDelete);

module.exports = router;