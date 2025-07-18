import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow sticky top-0 z-50 mb-6">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link to="/" className={`text-xl font-bold ${isActive('/') ? 'text-blue-700' : 'text-blue-600'} hover:text-blue-700 transition`}>BlogApp</Link>
          {user && (
            <Link to="/create" className={`text-gray-700 hover:text-blue-600 transition ${isActive('/create') ? 'font-semibold underline' : ''}`}>Create Post</Link>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <div className="flex items-center space-x-2">
                <span className="text-gray-700 hidden sm:inline">Hello, {user.username || user.email}!</span>
                <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold uppercase">
                  {user.username ? user.username[0] : user.email[0]}
                </div>
              </div>
              <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className={`text-gray-700 hover:text-blue-600 transition ${isActive('/login') ? 'font-semibold underline' : ''}`}>Login</Link>
              <Link to="/signup" className={`text-gray-700 hover:text-blue-600 transition ${isActive('/signup') ? 'font-semibold underline' : ''}`}>Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 