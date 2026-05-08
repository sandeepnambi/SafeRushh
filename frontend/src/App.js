// --- src/App.js ---
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';

import { Toaster } from 'react-hot-toast';

function App() {
  const { userInfo } = useAuth();

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route
          path="/login"
          element={userInfo ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route
          path="/"
          element={userInfo ? <DashboardPage /> : <Navigate to="/login" replace />}
        />
        {/* Redirect any other path to the correct page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;