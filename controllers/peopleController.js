const asyncHandler = require("express-async-handler");
const User = require('../models/user');
const Post = require('../models/post');
const Comment = require('../models/comment');
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
    const post = await Post.findById(req.params.postid).populate("comments").exec();
    if (post === null) {
        const err = new Error("Post not found");
        err.status = 404;
        return next(err);
    }
    res.render("post_info", { post: post, user: req.user.username });
});

exports.post_update_get = asyncHandler(async (req, res, next) => {
    res.render("post_form");
});

exports.post_update_post = [
    body("text", "Text must not be empty.")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render("home", {
                post: post,
                errors: errors.array()
            });
        } else {
            await Post.updateOne({ _id: req.params.postid }, {
                text: req.body.text
            });
            res.redirect("/people/" + req.user.username + "/posts/" + req.params.postid);
        }
    })
];

exports.post_delete_get = asyncHandler(async (req, res, next) => {

    // Delete all comments in post
    const post = await Post.findById(req.params.postid).populate("comments").exec();
    post.comments.forEach(async comment => {
        await Comment.deleteOne({ _id: comment._id });
    });

    // Delete post from database
    await Post.deleteOne({ _id: req.params.postid });
    
    res.redirect("/people/" + req.user.username);
});

exports.comment_create_get = asyncHandler(async (req, res, next) => {
    res.render("comment_form");
});

exports.comment_create_post = [
    body("text", "Text must not be empty.")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        const comment = new Comment({
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
            await comment.save();
            const post = await Post.findById(req.params.postid).exec();
            post.comments.push(comment._id);
            await post.save();
            res.redirect(post.url);
        }
    })
];

exports.comment_update_post = [
    body("text", "Text must not be empty.")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render("home", {
                post: post,
                errors: errors.array()
            });
        } else {
            console.log(req.params.commentid);
            await Comment.updateOne({ _id: req.params.commentid }, {
                text: req.body.text
            });
            res.redirect("/people/" + req.user.username + "/posts/" + req.params.postid);
        }
    })
];

exports.comment_delete_get = asyncHandler(async (req, res, next) => {

    // Delete comment from reference array in post
    await Post.updateOne({ _id: req.params.postid }, { $pull: { comments: req.params.commentid } });

    // Delete comment from database
    await Comment.deleteOne({ _id: req.params.commentid });

    res.redirect("/people/" + req.user.username + "/posts/" + req.params.postid);
});