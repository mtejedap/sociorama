const asyncHandler = require("express-async-handler");
const User = require('../models/user');
const Post = require('../models/post');
const Comment = require('../models/comment');
const moment = require('moment');
const { body, validationResult } = require("express-validator");

function lowercase(str) {
    if (str.length === 0) {
      return str;
    }
    const firstCharLowercase = str.charAt(0).toLowerCase();
    return firstCharLowercase + str.slice(1);
}

exports.index = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ username: req.user.username }).populate("friends").exec();
    const posts = await Post.find().sort({ date: -1 }).limit(10).populate("comments").exec();
    const userList = await User.find().sort({ firstname: 1 }).exec();
    res.render("home", { user: user, posts: posts, userList: userList, moment: moment, lowercase: lowercase });
});

exports.delete = asyncHandler(async (req, res, next) => {
    // Prevent users from being able to delete other users
    if (req.user.username !== req.params.userid) {
        res.redirect("/");
    }

    // Save username for queries
    const username = req.user.username;

    // Logout from session
    req.logout((err) => {
        if (err) {
            return next(err);
        }
    });

    // Delete all posts from the user and their respective comments
    const posts = await Post.find({ user: username }).populate("comments").exec();
    posts.forEach(async post => {
        post.comments.forEach(async comment => {
            await Comment.deleteOne({ _id: comment._id });
        });
        await Post.deleteOne({ _id: post._id });
    });

    // Delete the user and redirect to login page
    await User.deleteOne({ username: username });
    res.redirect("/");
});

exports.profile = asyncHandler(async (req, res, next) => {
    const profileUser = await User.findOne({ username: req.params.userid }).exec();
    const currentUser = await User.findOne({ username: req.user.username }).exec();
    const posts = await Post.find({ user: profileUser.username }).exec();
    res.render("profile", { profileUser: profileUser, currentUser: currentUser, posts: posts });
});

exports.friend = asyncHandler(async (req, res, next) => {
    await User.updateOne({ username: req.params.userid }, { $push: { friendRequests: req.user.username } });
    res.redirect("/people/" + req.params.userid + "/profile");
});

exports.accept = asyncHandler(async (req, res, next) => {
    const friendRequestUser = await User.findOne({ username: req.params.userid }).exec();
    const currentUser = await User.findOne({ username: req.user.username }).exec();
    await User.updateOne({ username: req.user.username }, { $pull: { friendRequests: req.params.userid } });
    await User.updateOne({ username: req.user.username }, { $push: { friends: friendRequestUser._id } });
    await User.updateOne({ username: req.params.userid}, { $push: { friends: currentUser._id } });
    res.redirect("/people/" + req.user.username);
});

exports.reject = asyncHandler(async (req, res, next) => {
    await User.updateOne({ username: req.user.username }, { $pull: { friendRequests: req.params.userid } });
    res.redirect("/people/" + req.user.username);
});

exports.unfriend = asyncHandler(async (req, res, next) => {
    const friendRequestUser = await User.findOne({ username: req.params.userid }).exec();
    const currentUser = await User.findOne({ username: req.user.username }).exec();
    await User.updateOne({ username: req.params.userid }, { $pull: { friends: currentUser._id } });
    await User.updateOne({ username: req.user.username }, { $pull: { friends: friendRequestUser._id } });
    res.redirect("/people/" + req.params.userid + "/profile");
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
            user: req.user.username,
            userFirstName: req.user.firstname,
            userLastName: req.user.lastname,
            likes: 0
        });
        if (!errors.isEmpty()) {
            res.render("home", {
                post: post,
                errors: errors.array()
            });
        } else {
            await post.save();
            res.redirect("/");
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
            res.redirect("/");
        }
    })
];

exports.post_delete_post = asyncHandler(async (req, res, next) => {

    // Delete all comments in post
    const post = await Post.findById(req.params.postid).populate("comments").exec();
    post.comments.forEach(async comment => {
        await Comment.deleteOne({ _id: comment._id });
    });

    // Delete post from database
    await Post.deleteOne({ _id: req.params.postid });
    
    res.redirect("/people/" + req.user.username);
});

exports.like_post = asyncHandler(async (req, res, next) => {
    const post = await Post.findById(req.params.postid).exec();
    let buttonToggle = "";

    if (!post.likeUsers.includes(req.user.username)) {
        await Post.updateOne({ _id: req.params.postid }, { $inc: { likes: 1 } });
        await Post.updateOne({ _id: req.params.postid }, { $push: { likeUsers: req.user.username } });
        buttonToggle = "Unlike";
        postLikes = post.likes + 1;
    } else {
        await Post.updateOne({ _id: req.params.postid }, { $inc: { likes: -1 } });
        await Post.updateOne({ _id: req.params.postid }, { $pull: { likeUsers: req.user.username } });
        buttonToggle = "Like";
        postLikes = post.likes - 1;
    }

    return res.status(200).json({ postLikes: postLikes, buttonToggle: buttonToggle });
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
            res.redirect("/");
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
            await Comment.updateOne({ _id: req.params.commentid }, {
                text: req.body.text
            });
            res.redirect("/");
        }
    })
];

exports.comment_delete_post = asyncHandler(async (req, res, next) => {

    // Delete comment from reference array in post
    await Post.updateOne({ _id: req.params.postid }, { $pull: { comments: req.params.commentid } });

    // Delete comment from database
    await Comment.deleteOne({ _id: req.params.commentid });

    res.redirect("/");
});