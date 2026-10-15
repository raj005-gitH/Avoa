import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { logout } from '../api';
import toast from 'react-hot-toast';

export default function Navbar({ onSearch }) {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    setUser(null);
    toast.success('Logged out successfully');
    navigate('/');
    setMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(query);
    else navigate(`/?q=${encodeURIComponent(query)}`);
  };

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
      <div className="navbar__inner">
        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 3C16 3 4 12 4 20C4 25.523 9.477 30 16 30C22.523 30 28 25.523 28 20C28 12 16 3 16 3Z" fill="currentColor"/>
          </svg>
          Avoa
        </Link>

        {/* Inline search (hidden on small screens) */}
        <div className="search-wrap" style={{ display: 'none' }}>
          <form className="search-bar" onSubmit={handleSearch}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search destinations..."
            />
            <button type="submit" aria-label="Search">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </button>
          </form>
        </div>

        {/* Right actions */}
        <div className="navbar__actions">
          {user ? (
            <>
              <Link to="/listings/new" className="btn btn-primary btn-sm">
                + List your space
              </Link>
              <div style={{ position: 'relative' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setMenuOpen((v) => !v)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <span style={{
                    width: 26, height: 26, borderRadius: '50%',
                    background: 'linear-gradient(135deg,#FF385C,#6c63ff)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
                  }}>
                    {user.username[0].toUpperCase()}
                  </span>
                  {user.username}
                </button>
                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      style={{
                        position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                        background: 'white', borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-lg)', border: '1px solid rgba(0,0,0,.06)',
                        minWidth: 180, zIndex: 100, overflow: 'hidden',
                      }}
                    >
                      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--gray-100)', fontSize: '0.82rem', color: 'var(--gray-500)' }}>
                        Signed in as <strong style={{ color: 'var(--gray-900)' }}>{user.username}</strong>
                      </div>
                      <Link
                        to="/my-bookings"
                        onClick={() => setMenuOpen(false)}
                        style={{ display: 'block', width: '100%', textAlign: 'left', padding: '12px 16px', fontSize: '0.9rem', color: 'var(--gray-900)', fontWeight: 500, transition: 'var(--transition)' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gray-100)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        🧳 My Bookings
                      </Link>
                      <button
                        onClick={handleLogout}
                        style={{ width: '100%', textAlign: 'left', padding: '12px 16px', fontSize: '0.9rem', color: 'var(--brand)', fontWeight: 600, transition: 'var(--transition)', borderTop: '1px solid var(--gray-100)' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#fff0f2'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Log in</Link>
              <Link to="/signup" className="btn btn-primary btn-sm">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
