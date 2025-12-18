const express = require('express');
const authRouter = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/UserModel');
const authMiddleware = require('../middlewares/authMiddleware');

// Login
authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !email.trim()) return res.status(400).json({ message: 'Email is required' });
    if (!password) return res.status(400).json({ message: 'Password is required' });

    const normalizedEmail = email.trim().toLowerCase();

    
    const user = await User.findOne({ email: normalizedEmail, authProvider: 'local' });
    if (!user) return res.status(404).json({ message: 'No account found with this email. Please sign up first.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password.' });

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

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
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed. Please try again later.' });
  }
});


authRouter.post('/register', async (req, res) => {
  try {
    const { name, email, password, location } = req.body;

    if (!name || !name.trim()) return res.status(400).json({ message: 'Name is required' });
    if (!email || !email.trim()) return res.status(400).json({ message: 'Email is required' });
    if (!password) return res.status(400).json({ message: 'Password is required' });
    if (!location || !location.trim()) return res.status(400).json({ message: 'Location is required' });
    if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters long' });

    const normalizedEmail = email.trim().toLowerCase();

    
    const existingUser = await User.findOne({ email: normalizedEmail, authProvider: 'local' });
    if (existingUser) return res.status(409).json({ message: 'Email already exists. Please sign in.' });

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      location: location.trim(),
      authProvider: 'local'
    });

    await newUser.save();

    const token = jwt.sign(
      { userId: newUser._id, email: normalizedEmail },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        location: newUser.location,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 11000) return res.status(409).json({ message: 'Email already exists. Please sign in.' });
    res.status(500).json({ message: 'Registration failed. Please try again later.' });
  }
});


authRouter.post('/validate', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(401).json({ ok: false, message: 'Unauthorized' });

    res.status(200).json({
      ok: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        location: user.location,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Validate endpoint error:', error.message);
    res.status(500).json({ ok: false, message: 'Internal Server Error' });
  }
});

module.exports = authRouter;
