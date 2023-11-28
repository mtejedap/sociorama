const express = require('express');
const peopleController = require('../controllers/peopleController');
const router = express.Router();

// GET user home page
router.get('/:userid', peopleController.index);

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

// // GET request for deleting a post
// router.get('/:userid/posts/:postid/delete', peopleController.post_delete_get);

// // POST request for deleting a post
// router.post('/:userid/posts/:postid/delete', peopleController.post_delete_post);

module.exports = router;