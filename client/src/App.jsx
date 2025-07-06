// src/App.jsx - Main application with routing
import { Routes, Route } from 'react-router-dom';
import PostList from './pages/PostList';
import SinglePost from './pages/SinglePost';
import CreatePost from './pages/CreatePost';
import EditPost from './pages/EditPost';
import Login from './pages/Login';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        <Route path="/" element={<PostList />} />
        <Route path="/posts/:id" element={<SinglePost />} />
        <Route path="/create" element={<CreatePost />} />
        <Route path="/edit/:id" element={<EditPost />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </div>
  );
}

export default App;