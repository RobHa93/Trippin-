import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function UserMenu({ fixed = true }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    navigate('/login', { replace: true });
  };

  const initial = user?.email?.[0]?.toUpperCase() || '?';

  return (
    <div ref={menuRef} className={`relative ${fixed ? 'fixed top-4 right-4 z-50' : ''}`}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-center w-10 h-10 font-semibold text-white transition rounded-full shadow-lg bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 hover:shadow-xl"
      >
        {initial}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 overflow-hidden bg-white border border-gray-100 shadow-2xl w-60 rounded-2xl">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-xs text-gray-400">Angemeldet als</p>
            <p className="text-sm font-medium text-gray-800 truncate">{user?.email}</p>
          </div>
          <button
            onClick={() => { setOpen(false); navigate('/saved'); }}
            className="flex items-center w-full gap-2 px-4 py-2.5 text-sm text-left text-gray-700 hover:bg-gray-50 transition"
          >
            <span>❤️</span> Gespeicherte Ziele
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center w-full gap-2 px-4 py-2.5 text-sm text-left text-red-600 border-t border-gray-100 hover:bg-red-50 transition"
          >
            <span>🚪</span> Abmelden
          </button>
        </div>
      )}
    </div>
  );
}
