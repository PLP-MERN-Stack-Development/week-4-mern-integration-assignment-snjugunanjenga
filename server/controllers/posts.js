// controllers/posts.js - Logic for post routes
const Post = require('../models/Post');
const { validationResult } = require('express-validator');

// Get all posts
exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('category', 'name')
      .populate('author', 'username');
    res.json(posts);
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
    const { title, content, category } = req.body;
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
    res.status(500).json({ message: 'Server error' });
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