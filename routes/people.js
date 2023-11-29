const express = require('express');
const peopleController = require('../controllers/peopleController');
const router = express.Router();

// GET user home page
router.get('/:userid', peopleController.index);

// GET user profile page
router.get('/:userid/profile', peopleController.profile);

// GET request for sending friend request
router.get('/:userid/friend', peopleController.friend);

// GET request for accepting friend request
router.get('/:userid/accept', peopleController.accept);

// GET request for rejecting friend request
router.get('/:userid/reject', peopleController.reject);

// GET request for removing friend
router.get('/:userid/unfriend', peopleController.unfriend);

// GET request for creating a post
router.get('/:userid/posts/create', peopleController.post_create_get);

// POST request for creating a post
router.post('/:userid/posts/create', peopleController.post_create_post);

// GET request for reading a post
router.get('/:userid/posts/:postid', peopleController.post_read_get);

// GET request for updating a post
router.get('/:userid/posts/:postid/update', peopleController.post_update_get);

// POST request for updating a post
router.post('/:userid/posts/:postid/update', peopleController.post_update_post);

// GET request for deleting a post
router.get('/:userid/posts/:postid/delete', peopleController.post_delete_get);

// POST request for liking a post
router.post('/:userid/posts/:postid/like', peopleController.like_post);

// GET request for creating a comment
router.get('/:userid/posts/:postid/comments/create', peopleController.comment_create_get);

// POST request for creating a comment
router.post('/:userid/posts/:postid/comments/create', peopleController.comment_create_post);

// POST request for updating a comment
router.post('/:userid/posts/:postid/comments/:commentid/update', peopleController.comment_update_post);

// GET request for deleting a comment
router.get('/:userid/posts/:postid/comments/:commentid/delete', peopleController.comment_delete_get);

module.exports = router;