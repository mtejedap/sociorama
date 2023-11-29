const express = require('express');
const peopleController = require('../controllers/peopleController');
const router = express.Router();

// Only allow authenticated users to access the site
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/');
    }
} 

// GET user home page
router.get('/:userid', checkAuthenticated, peopleController.index);

// GET user profile page
router.get('/:userid/profile', checkAuthenticated, peopleController.profile);

// GET request for sending friend request
router.get('/:userid/friend', checkAuthenticated, peopleController.friend);

// GET request for accepting friend request
router.get('/:userid/accept', checkAuthenticated, peopleController.accept);

// GET request for rejecting friend request
router.get('/:userid/reject', checkAuthenticated, peopleController.reject);

// GET request for removing friend
router.get('/:userid/unfriend', checkAuthenticated, peopleController.unfriend);

// GET request for creating a post
router.get('/:userid/posts/create', checkAuthenticated, peopleController.post_create_get);

// POST request for creating a post
router.post('/:userid/posts/create', checkAuthenticated, peopleController.post_create_post);

// GET request for reading a post
router.get('/:userid/posts/:postid', checkAuthenticated, peopleController.post_read_get);

// GET request for updating a post
router.get('/:userid/posts/:postid/update', checkAuthenticated, peopleController.post_update_get);

// POST request for updating a post
router.post('/:userid/posts/:postid/update', checkAuthenticated, peopleController.post_update_post);

// GET request for deleting a post
router.get('/:userid/posts/:postid/delete', checkAuthenticated, peopleController.post_delete_get);

// POST request for liking a post
router.post('/:userid/posts/:postid/like', checkAuthenticated, peopleController.like_post);

// GET request for creating a comment
router.get('/:userid/posts/:postid/comments/create', checkAuthenticated, peopleController.comment_create_get);

// POST request for creating a comment
router.post('/:userid/posts/:postid/comments/create', checkAuthenticated, peopleController.comment_create_post);

// POST request for updating a comment
router.post('/:userid/posts/:postid/comments/:commentid/update', checkAuthenticated, peopleController.comment_update_post);

// GET request for deleting a comment
router.get('/:userid/posts/:postid/comments/:commentid/delete', checkAuthenticated, peopleController.comment_delete_get);

module.exports = router;