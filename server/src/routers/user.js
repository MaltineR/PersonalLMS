const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const userRouter = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/UserModel'); // Assuming you have a User model defined


userRouter.get('/', authMiddleware, (req, res) => {
    try {
        res.send('User endpoint is working!');
    } catch (error) {
        console.error('Error handling request:', error);
        res.status(500).send('Internal Server Error');
    }
});

userRouter.get('/me', authMiddleware, async (req, res) => {
    try {
        const userId = req.userId; // Set by your authMiddleware from JWT

        const user = await User.findById(userId)
            .select('-password') // exclude password from response
            .populate('booksOwned') // optional: if you want user's books

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({ user });

    } catch (error) {
        console.error("Error occurred in fetching user details:", error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});
module.exports = userRouter;
