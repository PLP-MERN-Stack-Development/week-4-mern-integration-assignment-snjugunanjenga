// controllers/posts.js - Logic for post routes
const Post = require('../models/Post');
const { validationResult } = require('express-validator');

// Get all posts with filtering, sorting, and pagination
exports.getPosts = async (req, res) => {
  try {
    const { category, sort = 'desc', page = 1, limit = 10 } = req.query;
    const filter = {};
    if (category) filter.category = category;
    const sortOption = { createdAt: sort === 'asc' ? 1 : -1 };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const posts = await Post.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('category', 'name')
      .populate('author', 'username');
    const total = await Post.countDocuments(filter);
    res.json({ posts, total });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a specific post
exports.getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('category', 'name')
      .populate('author', 'username');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a post
exports.updatePost = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { title, content, category } = req.body;
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { title, content, category, updatedAt: Date.now() },
      { new: true }
    );
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json({ message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new post and emit Socket.io event
exports.createPost = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { title, content, category } = req.body;

    // Check if category exists
    const Category = require('../models/Category');
    const foundCategory = await Category.findById(category);
    if (!foundCategory) {
      return res.status(400).json({ message: 'Selected category does not exist' });
    }

    const post = new Post({
      title,
      content,
      author: req.user.id,
      category,
    });
    await post.save();

    // Emit Socket.io event for new post
    const io = req.app.get('socketio');
    io.emit('newPost', post);

    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    // Handle duplicate slug error
    if (error.code === 11000 && error.keyPattern && error.keyPattern.slug) {
      return res.status(400).json({ message: 'A post with this title already exists. Please use a different title.' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get the count of posts by the logged-in user
exports.getUserPostsCount = async (req, res) => {
  try {
    const count = await Post.countDocuments({ author: req.user.id });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};