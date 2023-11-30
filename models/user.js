const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    posts: [{ type: Schema.Types.ObjectId, ref: "Post" }],
    friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
    friendRequests: [{ type: String }]
});

module.exports = mongoose.model("User", UserSchema);