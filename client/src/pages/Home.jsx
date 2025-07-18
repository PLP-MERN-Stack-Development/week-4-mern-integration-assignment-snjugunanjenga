import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/posts?limit=3').then(res => {
      setPosts(res.data.posts || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-xl w-full text-center mb-8">
        <h1 className="text-4xl font-bold text-blue-700 mb-4">Welcome to PLP MERN-STACK BLOG APP!</h1>
        <p className="text-lg text-gray-700 mb-6">
          Share your knowledge, experiences, and questions about <span className="font-semibold text-blue-600">Software Development</span>.<br/>
          Register now to join the community and start posting your own blogs!
        </p>
        <div className="flex justify-center gap-4 mb-4">
          <Link to="/signup">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded shadow transition">Register</button>
          </Link>
          <Link to="/login">
            <button className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded shadow transition">Login</button>
          </Link>
        </div>
      </div>
      <div className="w-full max-w-2xl">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Recent Posts</h2>
        {loading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : posts.length === 0 ? (
          <div className="text-center text-gray-500">No posts yet. Be the first to post!</div>
        ) : (
          <div className="space-y-4">
            {posts.map(post => (
              <Link to={`/posts/${post._id}`} key={post._id} className="block group">
                <div className="bg-white rounded-lg shadow hover:shadow-lg transition p-4 relative">
                  <h3 className="text-xl font-bold text-blue-700 mb-1 group-hover:underline">
                    {post.title}
                  </h3>
                  <div className="text-sm text-gray-500 mb-2">
                    by {post.author?.username || 'Unknown'}
                  </div>
                  <div className="text-gray-700 mb-2 line-clamp-2">
                    {post.content.length > 120 ? post.content.slice(0, 120) + '...' : post.content}
                  </div>
                  {/* Tooltip with solid background */}
                  <div className="absolute right-4 top-4 group-hover:block hidden z-10">
                    <div className="bg-gray-900 text-white text-xs rounded px-3 py-2 shadow-lg" style={{backgroundColor: '#222', opacity: 1, border: '1px solid #333'}}>
                      Click to read more
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home; 