const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const PostSchema = new Schema({
    text: { type: String, required: true },
    date: { type: Date, required: true },
    user: [{ type: Schema.Types.ObjectId, ref: "User" }],
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }]
});

module.exports = mongoose.model("Post", PostSchema);