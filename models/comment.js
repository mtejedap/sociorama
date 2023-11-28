const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    text: { type: String, required: true },
    date: { type: Date, required: true },
    user: [{ type: Schema.Types.ObjectId, ref: "User" }]
});

module.exports = mongoose.model("Comment", CommentSchema);