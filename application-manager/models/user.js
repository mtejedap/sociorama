const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    applications: [{ type: Schema.Types.ObjectId, ref: "Application" }]
});

module.exports = mongoose.model("User", UserSchema);