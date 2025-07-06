// src/pages/PostList.jsx - Display list of blog posts
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import useApi from '../hooks/useApi';
import socket from '../services/socket';

const PostList = () => {
  const { data: posts, loading, error } = useApi('get', '/api/posts');

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
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Blog Posts</h1>
        <Link to="/create">
          <Button>Create Post</Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts?.map((post) => (
          <Card key={post._id} className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>{post.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{post.content.substring(0, 100)}...</p>
              <Link to={`/posts/${post._id}`}>
                <Button variant="outline" className="mt-2">Read More</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PostList;