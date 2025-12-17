const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    avatar:{
        type: String,
        default: 'https://www.gravatar.com/avatar/'
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: function() {
            return this.authProvider !== 'google';
        }
    },
    authProvider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local'
    },
    googleId: {
        type: String,
        sparse: true
    },
    location: {
        type: String
    },
    booksOwned: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
    booksReading: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
    booksBorrowed: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
    booksLent: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
    noofbooksLent: { type: Number, default: 0 },
    totalbooksread: { type: Number, default: 0 },

    
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    }

}, {
    timestamps: true
});


userSchema.index({ email: 1, authProvider: 1 });

const User = mongoose.models.User || mongoose.model('User', userSchema);
module.exports = User;

