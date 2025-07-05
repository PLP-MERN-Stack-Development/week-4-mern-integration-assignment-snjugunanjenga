// routes/posts.js - API routes for blog posts
const express = require('express');
const router = express.Router();
const { getPosts, getPost, createPost, updatePost, deletePost } = require('../controllers/posts');
const auth = require('../middleware/auth');

// Public routes
router.get('/', getPosts); // Get all posts
router.get('/:id', getPost); // Get a specific post

// Protected routes (require authentication)
router.post('/', auth, createPost); // Create a new post
router.put('/:id', auth, updatePost); // Update an existing post
router.delete('/:id', auth, deletePost); // Delete a post

module.exports = router;