// --- src/pages/DashboardPage.js ---
import React from 'react';
import { useAuth } from '../context/AuthContext';
import Map from '../components/Map';

function DashboardPage() {
  const { logout, userInfo } = useAuth();

  return (
    <div>
      <button onClick={logout} className="logout-btn">
        Logout ({userInfo.name})
      </button>
      <Map />
    </div>
  );
}

export default DashboardPage;