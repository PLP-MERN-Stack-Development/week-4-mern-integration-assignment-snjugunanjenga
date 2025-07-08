// src/pages/PostList.jsx - Display list of blog posts
import React, { useEffect, useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import useApi from '../hooks/useApi';
import api from '../services/api';
import socket from '../services/socket';
import { AuthContext } from '../context/AuthContext';

const PAGE_SIZE = 10;

const PostList = () => {
  const { user } = useContext(AuthContext);
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [sort, setSort] = useState('desc');
  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch categories for filter
  useEffect(() => {
    api.get('/api/categories').then(res => {
      setCategories(res.data);
    }).catch(() => {
      setCategories([]);
    });
  }, []);

  // Fetch posts with filter, sort, and pagination
  useEffect(() => {
    setLoading(true);
    setError(null);
    const params = {
      sort,
      page,
      limit: PAGE_SIZE,
    };
    if (category) params.category = category;
    api.get('/api/posts', { params })
      .then(res => {
        setPosts(res.data.posts);
        setTotal(res.data.total);
      })
      .catch(err => {
        setError(err.response?.data?.message || 'An error occurred');
      })
      .finally(() => setLoading(false));
  }, [category, sort, page]);

  // Socket for new posts (optional: could refetch or optimistically update)
  useEffect(() => {
    socket.connect();
    socket.on('newPost', (newPost) => {
      // Optionally refetch or update posts
    });
    socket.on('disconnect', () => {});
    return () => {
      socket.disconnect();
    };
  }, []);

  const totalPages = Math.ceil(total / PAGE_SIZE);

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
        <div className="flex flex-wrap gap-4 mb-6 items-center">
          <div>
            <label className="mr-2 font-medium">Category:</label>
            <select
              value={category}
              onChange={e => { setCategory(e.target.value); setPage(1); }}
              className="border rounded px-2 py-1"
            >
              <option value="">All</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mr-2 font-medium">Sort by date:</label>
            <select
              value={sort}
              onChange={e => { setSort(e.target.value); setPage(1); }}
              className="border rounded px-2 py-1"
            >
              <option value="desc">Newest</option>
              <option value="asc">Oldest</option>
            </select>
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Latest Posts</h2>
        {loading ? (
          <div className="text-center p-4">Loading...</div>
        ) : error ? (
          <div className="text-center p-4 text-red-500">{error}</div>
        ) : (!posts || posts.length === 0) ? (
          <div className="text-center text-gray-500 py-12 text-xl">No posts yet. Be the first to create one!</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Card key={post._id} className="shadow-md hover:shadow-xl transition-shadow border border-gray-100">
                  <CardHeader>
                    <CardTitle className="truncate">{post.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{post.category?.name}</span>
                      <span className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-600 mb-2 line-clamp-3">{post.content.substring(0, 120)}...</p>
                    <Link to={`/posts/${post._id}`}>
                      <Button variant="outline" className="mt-2 w-full">Read More</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
            {/* Pagination */}
            <div className="flex justify-center items-center gap-2 mt-8">
              <Button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                variant="outline"
              >
                Previous
              </Button>
              {Array.from({ length: totalPages }, (_, i) => (
                <Button
                  key={i + 1}
                  onClick={() => setPage(i + 1)}
                  variant={page === i + 1 ? 'default' : 'outline'}
                  className="mx-1"
                >
                  {i + 1}
                </Button>
              ))}
              <Button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages || totalPages === 0}
                variant="outline"
              >
                Next
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PostList;