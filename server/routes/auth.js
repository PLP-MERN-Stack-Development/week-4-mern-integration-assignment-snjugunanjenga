// routes/auth.js - Authentication routes
const express = require('express');
const router = express.Router();
const { register, login, me } = require('../controllers/auth');
const { body } = require('express-validator');
const auth = require('../middleware/auth');

// Register a new user
router.post(
  '/register',
  [
    body('username').notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
  ],
  register
);

// Login a user
router.post('/login', login);

// Get current user info
router.get('/me', auth, me);

module.exports = router;