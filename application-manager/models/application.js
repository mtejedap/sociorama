const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ApplicationSchema = new Schema({
    title: { type: String, required: true },
    location: { type: String, required: true },
    status: { type: String, required: true },
    type: { type: String, required: true },
    pay: { type: Number },
    contact: { type: String }
});

module.exports = mongoose.model("Application", ApplicationSchema);