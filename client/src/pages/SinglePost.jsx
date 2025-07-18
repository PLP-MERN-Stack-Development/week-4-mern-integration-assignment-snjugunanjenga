import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'sonner';

const SinglePost = () => {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/posts/${id}`);
        setPost(response.data);
      } catch (err) {
        setError('Failed to fetch post');
        console.error('Error fetching post:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await axios.delete(`http://localhost:5000/api/posts/${id}`);
        toast.success('Post deleted successfully!');
        navigate('/');
      } catch (err) {
        setError('Failed to delete post');
        toast.error('Failed to delete post: ' + (err.response?.data?.message || err.message));
        console.error('Error deleting post:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Post not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-3xl font-bold text-gray-900">{post.title}</h1>
            {user && (
              <div className="flex space-x-2">
                <button
                  onClick={() => navigate(`/edit/${id}`)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
          
          {post.category && (
            <div className="mb-4">
              <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
                {post.category?.name || post.category}
              </span>
            </div>
          )}
          
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed">{post.content}</p>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>Created: {new Date(post.createdAt).toLocaleDateString()}</span>
              {post.updatedAt && post.updatedAt !== post.createdAt && (
                <span>Updated: {new Date(post.updatedAt).toLocaleDateString()}</span>
              )}
            </div>
          </div>
          
          <div className="mt-6">
            <button
              onClick={() => navigate('/')}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Back to Posts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SinglePost; 