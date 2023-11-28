const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const PostSchema = new Schema({
    text: { type: String, required: true },
    date: { type: Date, required: true },
    user: { type: String, required: true },
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }]
});

PostSchema.virtual("url").get(function () {
    return `/people/${this.user}/posts/${this._id}`;
});

module.exports = mongoose.model("Post", PostSchema);