const asyncHandler = require("express-async-handler");
const User = require('../models/user');
const Post = require('../models/post');
const Comment = require('../models/comment');
const moment = require('moment');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require("express-validator");

// Initialize multer for handling profile picture uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/')
    },
    filename: async function (req, file, cb) {
        // Update database with reference to profile picture path
        await User.updateOne({ username: req.user.username }, { pfp: "/images/" +  req.user._id + "." + path.basename(file.mimetype)});
        cb(null, "" + req.user._id + "." + path.basename(file.mimetype));
    }
});
const upload = multer({ storage: storage });

// Turn the first character of a moment date string into lowercase for formatting purposes
function lowercase(str) {
    if (str.length === 0) {
      return str;
    }
    const firstCharLowercase = str.charAt(0).toLowerCase();
    return firstCharLowercase + str.slice(1);
}

// Display user home page
exports.index = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ username: req.user.username }).populate("friends").populate("friendRequests").exec();
    const posts = await Post.find().sort({ date: -1 }).limit(10).populate({ path: "comments", options: { sort: { "date": -1 } } }).exec();
    const userList = await User.find().sort({ firstname: 1 }).exec();
    res.render("home", { user: user, posts: posts, userList: userList, moment: moment, lowercase: lowercase });
});

// Delete an user from the database
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

// Display user profile page
exports.profile = asyncHandler(async (req, res, next) => {
    const profileUser = await User.findOne({ username: req.params.userid }).exec();
    const currentUser = await User.findOne({ username: req.user.username }).exec();
    const posts = await Post.find({ user: profileUser.username }).exec();
    res.render("profile", { profileUser: profileUser, currentUser: currentUser, posts: posts });
});

// Delete existing pfp and replace it with a new one
exports.updatePfp = asyncHandler(async (req, res, next) => {
    if (fs.existsSync('public/images/' + req.user._id + ".jpg")) {
        fs.unlink('public/images/' + req.user._id + ".jpg", (err) => {
            if (err) {
                console.error('Error deleting previous file:', err);
            }
        });
    } else if (fs.existsSync('public/images/' + req.user._id + ".jpeg")) {
        fs.unlink('public/images/' + req.user._id + ".jpeg", (err) => {
            if (err) {
                console.error('Error deleting previous file:', err);
            }
        });
    } else if (fs.existsSync('public/images/' + req.user._id + ".png")) {
        fs.unlink('public/images/' + req.user._id + ".png", (err) => {
            if (err) {
                console.error('Error deleting previous file:', err);
            }
        });
    }
    upload.single('pfp')(req, res, next);
    res.redirect("/people/" + req.user.username + "/profile");
});

// Add friend request to an user's friend request list
exports.sendFriendRequest = asyncHandler(async (req, res, next) => {
    await User.updateOne({ username: req.params.userid }, { $push: { friendRequests: req.user._id } });
    res.redirect("/people/" + req.params.userid + "/profile");
});

// Accept friend request
exports.acceptFriendRequest = asyncHandler(async (req, res, next) => {
    const friendRequestUser = await User.findOne({ username: req.params.userid }).exec();
    await User.updateOne({ username: req.user.username }, { $pull: { friendRequests: friendRequestUser._id } });
    await User.updateOne({ username: req.user.username }, { $push: { friends: friendRequestUser._id } });
    await User.updateOne({ username: req.params.userid}, { $push: { friends: req.user._id } });
    res.redirect("/people/" + req.user.username);
});

// Reject friend request
exports.rejectFriendRequest = asyncHandler(async (req, res, next) => {
    const friendRequestUser = await User.findOne({ username: req.params.userid }).exec();
    await User.updateOne({ username: req.user.username }, { $pull: { friendRequests: friendRequestUser._id } });
    res.redirect("/people/" + req.user.username);
});

// Remove friend from user's friend list
exports.removeFriend = asyncHandler(async (req, res, next) => {
    const friendRequestUser = await User.findOne({ username: req.params.userid }).exec();
    const currentUser = await User.findOne({ username: req.user.username }).exec();
    await User.updateOne({ username: req.params.userid }, { $pull: { friends: currentUser._id } });
    await User.updateOne({ username: req.user.username }, { $pull: { friends: friendRequestUser._id } });
    res.redirect("/people/" + req.params.userid + "/profile");
});

// Create post
exports.postCreate = [
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
            pfp: req.user.pfp,
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

// Display post
exports.postRead = asyncHandler(async (req, res, next) => {
    const post = await Post.findById(req.params.postid).populate("comments").exec();
    if (post === null) {
        const err = new Error("Post not found");
        err.status = 404;
        return next(err);
    }
    res.render("post_info", { post: post, user: req.user.username });
});

// Update post
exports.postUpdate = [
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

// Delete post
exports.postDelete = asyncHandler(async (req, res, next) => {
    // Delete all comments in post
    const post = await Post.findById(req.params.postid).populate("comments").exec();
    post.comments.forEach(async comment => {
        await Comment.deleteOne({ _id: comment._id });
    });
    // Delete post from database
    await Post.deleteOne({ _id: req.params.postid });
    res.redirect("/people/" + req.user.username);
});

// Like/unlike a post depending on whether the user has liked it or not before
exports.likePost = asyncHandler(async (req, res, next) => {
    const post = await Post.findById(req.params.postid).exec();
    let buttonToggle = "";
    if (!post.likeUsers.includes(req.user.username)) {
        await Post.updateOne({ _id: req.params.postid }, { $inc: { likes: 1 } });
        await Post.updateOne({ _id: req.params.postid }, { $push: { likeUsers: req.user.username } });
        postLikes = post.likes + 1;
    } else {
        await Post.updateOne({ _id: req.params.postid }, { $inc: { likes: -1 } });
        await Post.updateOne({ _id: req.params.postid }, { $pull: { likeUsers: req.user.username } });
        postLikes = post.likes - 1;
    }
    return res.status(200).json({ postLikes: postLikes });
});

// Create comment
exports.commentCreate = [
    body("text", "Text must not be empty.")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        const comment = new Comment({
            text: req.body.text,
            date: new Date(),
            user: req.user.username,
            userFirstName: req.user.firstname,
            userLastName: req.user.lastname,
            pfp: req.user.pfp
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

// Update comment
exports.commentUpdate = [
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

// Delete comment
exports.commentDelete = asyncHandler(async (req, res, next) => {
    // Delete comment from reference array in post
    await Post.updateOne({ _id: req.params.postid }, { $pull: { comments: req.params.commentid } });
    // Delete comment from database
    await Comment.deleteOne({ _id: req.params.commentid });
    res.redirect("/");
});