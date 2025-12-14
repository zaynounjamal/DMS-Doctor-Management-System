import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-4">Loading...</div>; // Or null, managed by App
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role?.toLowerCase())) {
    // Unauthorized role
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
