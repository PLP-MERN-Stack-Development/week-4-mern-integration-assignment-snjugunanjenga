// config/db.js - MongoDB connection setup using Mongoose
const mongoose = require('mongoose');

// Asynchronous function to connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true, // Avoid deprecated URL parser
      useUnifiedTopology: true, // Use new topology engine
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;