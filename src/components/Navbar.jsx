import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav className="bg-white border-b border-gray-200 h-16 sticky top-0 z-50 flex items-center justify-between px-6 lg:px-12">
      <div className="flex items-center gap-12 h-full">
        <div className="font-bold text-xl tracking-wide text-gray-900">FAKESHIELD</div>
        <div className="hidden md:flex items-center gap-6 h-full">
          <NavLink 
            to="/" 
            className={({ isActive }) => `text-sm font-medium flex items-center h-full border-b-2 ${isActive ? 'text-gray-900 border-gray-900' : 'text-gray-500 border-transparent hover:text-gray-900'}`}
          >
            Dashboard
          </NavLink>
          <NavLink 
            to="/history" 
            className={({ isActive }) => `text-sm font-medium flex items-center h-full border-b-2 ${isActive ? 'text-gray-900 border-gray-900' : 'text-gray-500 border-transparent hover:text-gray-900'}`}
          >
            History
          </NavLink>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {isAuthenticated ? (
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">{user?.name || 'User'}</span>
            <button onClick={logout} className="text-sm text-red-600 hover:underline">Logout</button>
          </div>
        ) : (
          <>
            <NavLink to="/auth" className="text-sm font-medium text-gray-700 hover:text-gray-900">Masuk</NavLink>
            <NavLink to="/auth?mode=register" className="text-sm font-medium bg-[#1E293B] text-white px-5 py-2 rounded-md hover:bg-gray-800 transition-colors">Daftar</NavLink>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;