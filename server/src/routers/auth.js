const express = require('express');
const authRouter = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const bcrypt = require('bcryptjs'); // For password hashing

const User = require('../models/UserModel'); // Assuming you have a User model defined


const authMiddleware = require('../middlewares/authMiddleware'); // Middleware for authentication

authRouter.get('/', (req, res) => {
    try {
        res.send('Auth endpoint is working!');
    } catch (error) {
        console.error('Error handling request:', error);
        res.status(500).send('Internal Server Error');
    }
});

authRouter.get("/google", passport.authenticate("google", {
    scope: ["profile", "email"]
}));

authRouter.get("/google/callback",
    passport.authenticate("google", {
        failureRedirect: `${process.env.CLIENT_URL}/signup`,
        session: false
    }),
    (req, res) => {
        const { token } = req.user;
        res.redirect(`${process.env.CLIENT_URL}/google/redirect?token=${token}`);
    }
);

authRouter.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("Login attempt with email:", email);
        console.log("Login attempt with password:", password);
        // Input validation
        if (!email || !email.trim()) {
            return res.status(400).json({ message: 'Email is required' });
        }
        
        if (!password) {
            return res.status(400).json({ message: 'Password is required' });
        }
        
        // Normalize email to lowercase
        const normalizedEmail = email.trim().toLowerCase();
        
        // Find user by email (FIXED: Use findOne instead of find)
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(404).json({ message: 'No account found with this email. Please sign up first.' });
        }
        
        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password. Please try again.' });
        }
        
        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user._id, 
                email: user.email 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' } // Extended token validity
        );
        
        // Send success response (don't include sensitive data)
        res.status(200).json({ 
            message: 'Login successful', 
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                location: user.location,
                role: user.role
            }
        });
        
    } catch (error) {
        console.error('Error during login:', error);
        
        // Handle specific errors
        if (error.name === 'JsonWebTokenError') {
            return res.status(500).json({ 
                message: 'Error creating authentication token' 
            });
        }
        
        if (error.name === 'CastError') {
            return res.status(400).json({ 
                message: 'Invalid request format' 
            });
        }
        
        // Generic server error
        res.status(500).json({ 
            message: 'Login failed. Please try again later.' 
        });
    }
});
authRouter.post('/register', async (req, res) => {
    try {
        const { name, email, password, location } = req.body;
        console.log("Registering user:", name, email, location);
        
        // Input validation
        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'Name is required' });
        }
        
        if (!email || !email.trim()) {
            return res.status(400).json({ message: 'Email is required' });
        }
        
        if (!password) {
            return res.status(400).json({ message: 'Password is required' });
        }
        
        if (!location || !location.trim()) {
            return res.status(400).json({ message: 'Location is required' });
        }
        
        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return res.status(400).json({ message: 'Please enter a valid email address' });
        }
        
        // Password strength validation
        if (password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long' });
        }
        
        // Check for password complexity (optional - uncomment if needed)
        // const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
        // if (!passwordRegex.test(password)) {
        //     return res.status(400).json({ 
        //         message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' 
        //     });
        // }
        
        // Normalize email to lowercase
        const normalizedEmail = email.trim().toLowerCase();
        
        // Check if user already exists
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(409).json({ 
                message: 'An account with this email already exists. Please try signing in instead.' 
            });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12); // Increased salt rounds for better security
        
        // Create and save the new user
        const newUser = new User({ 
            name: name.trim(), 
            email: normalizedEmail, 
            password: hashedPassword, 
            location: location.trim() 
        });
        
        await newUser.save();
        
        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: newUser._id, // Include user ID in token
                email: normalizedEmail 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' } // Extended to 24 hours for better UX
        );
        
        // Send success response (don't include sensitive data)
        res.status(201).json({ 
            message: 'Registration successful', 
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                location: newUser.location
            }
        });
        
    } catch (error) {
        console.error('Error during registration:', error);
        
        // Handle specific database errors
        if (error.name === 'ValidationError') {
            // Mongoose validation error
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                message: 'Validation failed', 
                errors: validationErrors 
            });
        }
        
        if (error.code === 11000) {
            // MongoDB duplicate key error
            return res.status(409).json({ 
                message: 'An account with this email already exists. Please try signing in instead.' 
            });
        }
        
        if (error.name === 'JsonWebTokenError') {
            // JWT creation error
            return res.status(500).json({ 
                message: 'Error creating authentication token' 
            });
        }
        
        // Generic server error
        res.status(500).json({ 
            message: 'Registration failed. Please try again later.' 
        });
    }
});

authRouter.post('/validate', authMiddleware, (req, res) => {
    try {
        const email = req.user?.email;
        if (!email) {
            console.log("Unauthorized: ", email);
            return res.status(401).json({ message: "Unauthorized" });
        }
        return res.status(200).json({
            ok: true,
            message: "Authorized"
        });
    } catch (e) {
        console.log("Error during verifying user:", e);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})

module.exports = authRouter;