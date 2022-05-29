const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true
    },
    cognome: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    isValidUser: {
        type: Boolean,
        default: false
    }
})

const User = mongoose.model("user", userSchema);
module.exports = User;