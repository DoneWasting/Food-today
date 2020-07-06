const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required:true,
        trim:true,
        lowercase:true
    },
    firstName: {
        type: String,
        required:true,
        trim:true
    },
    lastName: {
        type: String,
        required:true,
        trim:true
    },
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});


const User = mongoose.model('User', UserSchema);

module.exports = User;