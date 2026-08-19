import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isActive = (path) =>
    location.pathname === path
      ? 'text-blue-600 border-b-2 border-blue-600'
      : 'text-gray-600 hover:text-blue-600';

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error('Error getting user:', error);
      } finally {
        setLoading(false);
      }
    };
    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => listener?.subscription?.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isDashboard = location.pathname === '/athlete-dashboard' || 
                      location.pathname === '/scout-dashboard';

  if (loading) {
    return (
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200/80 sticky top-0 z-50 px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap">
          <div className="flex items-center space-x-2">
            <i className="fas fa-search text-blue-600 text-2xl"></i>
            <span className="text-xl font-bold tracking-tight text-gray-800">
              Talent<span className="text-blue-600">Scout</span>
              <span className="text-sm font-normal text-gray-500 ml-1">AI</span>
            </span>
            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full ml-1 border border-blue-100">
              grassroots
            </span>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200/80 sticky top-0 z-50 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Link to="/" className="flex items-center space-x-2">
            <i className="fas fa-search text-blue-600 text-2xl"></i>
            <span className="text-xl font-bold tracking-tight text-gray-800">
              Talent<span className="text-blue-600">Scout</span>
              <span className="text-sm font-normal text-gray-500 ml-1">AI</span>
            </span>
            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full ml-1 border border-blue-100">
              grassroots
            </span>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              <Link 
                to="/athlete-dashboard" 
                className={isDashboard ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700 font-medium transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/" className={isActive('/')}>Home</Link>
              <Link to="/athlete-login" className={isActive('/athlete-login')}>Athlete</Link>
              <Link to="/scout-login" className={isActive('/scout-login')}>Scout</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;