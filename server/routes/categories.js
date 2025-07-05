// routes/categories.js - API routes for categories
const express = require('express');
const router = express.Router();
const { getCategories, createCategory } = require('../controllers/categories');
const auth = require('../middleware/auth');

// Public routes
router.get('/', getCategories); // Get all categories

// Protected routes
router.post('/', auth, createCategory); // Create a new category

module.exports = router;