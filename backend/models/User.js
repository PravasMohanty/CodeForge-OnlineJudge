const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    problemSolved: {
        type: Number,
        default: 0
    },
    solved: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Question'
        }
    ]

});

module.exports = mongoose.model('User', UserSchema)