require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const jwt = require('jsonwebtoken');

require('../src/middlewares/googleMiddleware');
const session = require('express-session');

const mongoose = require('mongoose');
const mongoUrl = process.env.DATABASE_URL;
const db = mongoose.connect(mongoUrl);

// Routers
const authRouter = require('./routers/auth');
const userRouter = require('./routers/user');
const bookRouter = require('./routers/book');
const emailTestRouter = require('./routers/emailTest');
const adminRouter = require('./routers/admin');   



const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(session({
  secret: JWT_SECRET,
  resave: false,
  saveUninitialized: true,
}));

// Registering API routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/user', userRouter);
app.use('/api/v1/book', bookRouter);
app.use('/api/v1/test', emailTestRouter);
app.use('/api/v1/admin', adminRouter);  

app.use(passport.initialize());
app.use(passport.session());

app.get('/', (_req, res) => {
  try {
      res.send('Hello World from the server!');
  } catch (error) {
      console.error('Error handling request:', error);
      res.status(500).send('Internal Server Error');
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
