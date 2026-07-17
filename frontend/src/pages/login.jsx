import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const redirectTo = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Bitte E-Mail und Passwort eingeben');
      return;
    }

    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError('E-Mail oder Passwort ist falsch');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center h-screen overflow-hidden bg-gradient-to-br from-orange-100 via-pink-50 to-purple-100">
      <div className="absolute inset-0 bg-gradient-to-tr from-yellow-200/30 via-orange-200/30 to-pink-300/40 animate-pulse" style={{ animationDuration: '8s' }}></div>
      <div className="absolute w-64 h-64 rounded-full top-20 right-20 bg-yellow-300/20 blur-3xl"></div>
      <div className="absolute rounded-full bottom-20 left-20 w-96 h-96 bg-orange-400/20 blur-3xl"></div>

      <div className="relative w-full max-w-md px-4">
        <div className="mb-8 text-center">
          <h1 className="flex items-center justify-center gap-3 mb-1">
            <span className="text-5xl drop-shadow-lg">🏝️</span>
            <span className="text-4xl font-bold text-transparent bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text">
              Trippin'
            </span>
          </h1>
          <p className="text-sm text-gray-500">Dein Reiseplaner für Kurztrips</p>
        </div>

        <div className="p-6 border shadow-2xl backdrop-blur-xl bg-white/80 rounded-3xl border-white/50">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                E-Mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@beispiel.ch"
                autoComplete="username"
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none transition shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                Passwort
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none transition shadow-sm"
              />
            </div>

            {error && (
              <div className="p-3 border border-red-200 bg-red-50 rounded-2xl">
                <p className="text-sm font-medium text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 font-bold text-white transition-all duration-200 transform shadow-lg bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 hover:from-orange-600 hover:via-pink-600 hover:to-purple-700 rounded-2xl hover:shadow-xl hover:scale-105 disabled:opacity-60 disabled:hover:scale-100"
            >
              {submitting ? 'Anmelden…' : 'Anmelden'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
