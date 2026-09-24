import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-100 via-pink-50 to-purple-100">
        <span className="text-3xl animate-pulse">✈️</span>
      </div>
    );
  }

  if (!user) {
    // login.jsx sends the user back here after signing in
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
