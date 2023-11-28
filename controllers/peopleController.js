const asyncHandler = require("express-async-handler");
const User = require('../models/user');
const Post = require('../models/post');
const { body, validationResult } = require("express-validator");

exports.index = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ username: req.user.username }).exec();
    console.log(user.id);
    const posts = await Post.find({ user: user.username }).exec();
    console.log(posts);
    res.render("home", { user: user, posts: posts });
});

exports.post_create_get = asyncHandler(async (req, res, next) => {
    res.render("post_form");
});

exports.post_create_post = [
    body("text", "Text must not be empty.")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        const post = new Post({
            text: req.body.text,
            date: new Date(),
            user: req.user.username
        });
        if (!errors.isEmpty()) {
            res.render("home", {
                post: post,
                errors: errors.array()
            });
        } else {
            await post.save();
            res.redirect(post.url);
        }
    })
];

exports.post_read_get = asyncHandler(async (req, res, next) => {
    const post = await Post.findById(req.params.postid).exec();
    if (post === null) {
        const err = new Error("Post not found");
        err.status = 404;
        return next(err);
    }
    res.render("post_info", { post: post });
});

exports.post_update_get = asyncHandler(async (req, res, next) => {
    res.render("post_form");
});

exports.post_update_post = asyncHandler(async (req, res, next) => {
    
});