// routes/posts.js - API routes for blog posts
const express = require('express');
const router = express.Router();
const { getPosts, getPost, createPost, updatePost, deletePost, getUserPostsCount } = require('../controllers/posts');
const auth = require('../middleware/auth');
const { body } = require('express-validator');

// Public routes
router.get('/', getPosts); // Get all posts
router.get('/:id', getPost); // Get a specific post

// Protected routes (require authentication)
router.get('/mine/count', auth, getUserPostsCount); // Get count of user's posts
router.post('/', auth, [
  body('title').notEmpty().withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required'),
  body('category').notEmpty().withMessage('Category is required').isString().withMessage('Category must be a string'),
], createPost); // Create a new post
router.put('/:id', auth, [
  body('title').notEmpty().withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required'),
  body('category').notEmpty().withMessage('Category is required').isString().withMessage('Category must be a string'),
], updatePost); // Update an existing post
router.delete('/:id', auth, deletePost); // Delete a post

module.exports = router;