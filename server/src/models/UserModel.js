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
    // New fields for Google OAuth
    authProvider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local'
    },
    googleId: {
        type: String,
        sparse: true // Allows null values but ensures uniqueness when present
    },
    location: {
        type: String
    },
    
    booksOwned: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book'
    }],
    booksReading: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book'
    }],
    booksBorrowed: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book'
    }]
    , 
    booksLent: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book'
    }]
    , 
    noofbooksLent: {
        type: Number,
        default: 0
    },
    totalbooksread: {
        type: Number,
        default: 0
    },

}, {
    timestamps: true
});

// Add compound index for email and authProvider for better query performance
userSchema.index({ email: 1, authProvider: 1 });

// Add index for googleId for faster lookups

const User = mongoose.model('User', userSchema);
module.exports = User;