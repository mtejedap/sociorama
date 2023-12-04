const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    text: { type: String, required: true },
    date: { type: Date, required: true },
    user: { type: String, required: true },
    userFirstName: { type: String, required: true },
    userLastName: { type: String, required: true }
});

module.exports = mongoose.model("Comment", CommentSchema);