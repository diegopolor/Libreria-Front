import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './context/authStore.js';
import { ProtectedRoute } from './routes/ProtectedRoute.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import Login from './pages/Login.jsx';
import Categories from './pages/Categories.jsx';
import Unauthorized from './pages/Unauthorized.jsx';

export default function App() {
  const { isAuthenticated } = useAuthStore();
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/categories" replace /> : <Login />} />
        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'LIBRARIAN', 'CLIENT']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'LIBRARIAN']} />}>
              <Route path="/categories" element={<Categories />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to={isAuthenticated ? '/categories' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
