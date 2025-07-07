// src/pages/PostList.jsx - Display list of blog posts
import { useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import useApi from '../hooks/useApi';
import socket from '../services/socket';
import { AuthContext } from '../context/AuthContext';

const PostList = () => {
  const { data: posts, loading, error } = useApi('get', '/api/posts');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    socket.connect();
    socket.on('newPost', (newPost) => {
      // Optimistically update the post list
      // This requires state management, which we'll add later
      console.log('New post:', newPost);
    });
    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  if (loading) return <div className="text-center p-4">Loading...</div>;
  if (error) return <div className="text-center p-4 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <section className="py-12 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-blue-700">Welcome to the MERN Blog App</h1>
        <p className="text-lg md:text-xl text-gray-600 mb-6">Share your thoughts, read posts, and connect with the community.</p>
        {user ? (
          <Link to="/create">
            <Button className="px-8 py-3 text-lg">Create Your First Post</Button>
          </Link>
        ) : (
          <Link to="/login">
            <Button className="px-8 py-3 text-lg">Login to Create a Post</Button>
          </Link>
        )}
      </section>
      <div className="container mx-auto p-4">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Latest Posts</h2>
        {(!posts || posts.length === 0) ? (
          <div className="text-center text-gray-500 py-12 text-xl">No posts yet. Be the first to create one!</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts?.map((post) => (
              <Card key={post._id} className="shadow-md hover:shadow-xl transition-shadow border border-gray-100">
                <CardHeader>
                  <CardTitle className="truncate">{post.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-2 line-clamp-3">{post.content.substring(0, 120)}...</p>
                  <Link to={`/posts/${post._id}`}>
                    <Button variant="outline" className="mt-2 w-full">Read More</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostList;