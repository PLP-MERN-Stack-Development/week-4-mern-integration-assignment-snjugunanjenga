// routes/auth.js - Authentication routes
const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/auth');
const { body } = require('express-validator');

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

module.exports = router;