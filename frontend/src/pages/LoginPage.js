// --- src/pages/LoginPage.js ---
import React, { useState } from 'react';
import Login from '../components/Login';
import Register from '../components/Register';

function LoginPage() {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="form-container">
      {showLogin ? (
        <>
          <h2>Driver Login</h2>
          <Login />
          <a href="#!" className="form-link" onClick={() => setShowLogin(false)}>
            Don't have an account? Register
          </a>
        </>
      ) : (
        <>
          <h2>Driver Register</h2>
          <Register />
          <a href="#!" className="form-link" onClick={() => setShowLogin(true)}>
            Already have an account? Login
          </a>
        </>
      )}
    </div>
  );
}

export default LoginPage;