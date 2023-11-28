const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    gender: { type: String, required: true },
    dob: { type: String, required: true },
    posts: [{ type: Schema.Types.ObjectId, ref: "Post" }]
});

module.exports = mongoose.model("User", UserSchema);