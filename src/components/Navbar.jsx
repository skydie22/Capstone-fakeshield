import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between h-16">
        <div className="flex items-center gap-12 h-full">
          <Link to="/" onClick={closeMenu} className="font-bold text-xl tracking-wide text-gray-900">FAKESHIELD</Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 h-full">
            <NavLink 
              to="/" 
              className={({ isActive }) => `text-sm font-medium flex items-center h-full border-b-2 transition-all ${isActive ? 'text-gray-900 border-gray-900' : 'text-gray-500 border-transparent hover:text-gray-900'}`}
            >
              Dashboard
            </NavLink>
            <NavLink 
              to="/news" 
              className={({ isActive }) => `text-sm font-medium flex items-center h-full border-b-2 transition-all ${isActive ? 'text-gray-900 border-gray-900' : 'text-gray-500 border-transparent hover:text-gray-900'}`}
            >
              News
            </NavLink>
            <NavLink 
              to="/history" 
              className={({ isActive }) => `text-sm font-medium flex items-center h-full border-b-2 transition-all ${isActive ? 'text-gray-900 border-gray-900' : 'text-gray-500 border-transparent hover:text-gray-900'}`}
            >
              History
            </NavLink>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Desktop User Section */}
          <div className="hidden md:flex items-center gap-6">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">{user?.name || 'User'}</span>
                <button onClick={logout} className="text-sm font-bold text-red-600 hover:text-red-700 uppercase tracking-widest text-[10px]">Logout</button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <NavLink to="/auth" className="text-sm font-medium text-gray-700 hover:text-gray-900">Masuk</NavLink>
                <NavLink to="/auth?mode=register" className="text-sm font-bold bg-[#1E293B] text-white px-5 py-2 rounded-md hover:bg-gray-800 transition-colors uppercase tracking-wider text-[11px]">Daftar</NavLink>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={toggleMenu}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 animate-in slide-in-from-top duration-200">
          <div className="px-6 py-4 space-y-1">
            <NavLink 
              to="/" 
              onClick={closeMenu}
              className={({ isActive }) => `block px-4 py-3 rounded-lg text-sm font-bold uppercase tracking-widest ${isActive ? 'bg-slate-50 text-[#1E293B]' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              Dashboard
            </NavLink>
            <NavLink 
              to="/news" 
              onClick={closeMenu}
              className={({ isActive }) => `block px-4 py-3 rounded-lg text-sm font-bold uppercase tracking-widest ${isActive ? 'bg-slate-50 text-[#1E293B]' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              News
            </NavLink>
            <NavLink 
              to="/history" 
              onClick={closeMenu}
              className={({ isActive }) => `block px-4 py-3 rounded-lg text-sm font-bold uppercase tracking-widest ${isActive ? 'bg-slate-50 text-[#1E293B]' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              History
            </NavLink>

            <div className="pt-4 mt-4 border-t border-gray-100">
              {isAuthenticated ? (
                <div className="flex flex-col gap-3 px-4">
                  <div className="text-sm font-medium text-gray-500">Masuk sebagai: <span className="text-gray-900 font-bold">{user?.name}</span></div>
                  <button 
                    onClick={() => { logout(); closeMenu(); }} 
                    className="text-left py-2 text-sm font-bold text-red-600 uppercase tracking-widest"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 px-2 pb-2">
                  <Link 
                    to="/auth" 
                    onClick={closeMenu}
                    className="py-3 text-center rounded-lg text-sm font-bold border border-gray-200 text-gray-700"
                  >
                    MASUK
                  </Link>
                  <Link 
                    to="/auth?mode=register" 
                    onClick={closeMenu}
                    className="py-3 text-center rounded-lg text-sm font-bold bg-[#1E293B] text-white"
                  >
                    DAFTAR
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;