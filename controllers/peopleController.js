const asyncHandler = require("express-async-handler");
const User = require('../models/user');

exports.index = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ username: req.user.username }).exec();
    res.render("home", { user: user });
});