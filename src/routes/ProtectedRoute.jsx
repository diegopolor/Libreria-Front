import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../context/authStore.js';

export const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role))
    return <Navigate to="/unauthorized" replace />;

  return <Outlet />;
};
