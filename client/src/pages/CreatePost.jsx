import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'sonner';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../components/ui/select';

const CreatePost = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);

  const firstTime = location.state?.firstTime;

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    // Fetch categories
    api.get('/api/categories').then(res => {
      setCategories(res.data);
    }).catch(() => {
      toast.error('Failed to load categories');
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      toast.error('Title and content are required');
      return;
    }
    if (!category) {
      setError('Category is required');
      toast.error('Category is required');
      return;
    }
    try {
      setCreateLoading(true);
      setError('');
      
      const response = await api.post('/api/posts', {
        title: title.trim(),
        content: content.trim(),
        category: category.trim()
      });
      toast.success('Post created successfully!');
      navigate(`/posts/${response.data._id}`);
    } catch (err) {
      if (err.response?.data?.errors) {
        setError(err.response.data.errors.map(e => e.msg).join(', '));
        toast.error('Please fix the highlighted errors.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
        toast.error('Failed to create post: ' + err.response.data.message);
      } else {
        setError('Failed to create post');
        toast.error('Failed to create post');
      }
      console.error('Error creating post:', err);
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Create New Post</h1>
          {firstTime && (
            <div className="mb-4 p-4 bg-blue-100 text-blue-800 rounded">
              Welcome! Start by creating your first post. Choose a category to help others find your content.
            </div>
          )}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter post title"
                required
              />
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger id="category" className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Content *
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter post content"
                required
              />
            </div>
            
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={createLoading}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-6 py-2 rounded"
              >
                {createLoading ? 'Creating...' : 'Create Post'}
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/')}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePost; 