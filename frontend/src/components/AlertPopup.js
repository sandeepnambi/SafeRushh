// --- src/components/AlertPopup.js ---
import React from 'react';

const alertStyle = {
  position: 'absolute',
  bottom: '30px',
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 20,
  background: '#d93025',
  color: 'white',
  padding: '1rem 2rem',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
  fontSize: '1.1rem',
  fontWeight: '600',
  textAlign: 'center',
};

function AlertPopup({ message }) {
  if (!message) return null;

  return (
    <div style={alertStyle}>
      ⚠️ {message}
    </div>
  );
}

// HOW YOU WOULD USE THIS LATER:
// 1. In DashboardPage.js, you'd get the driver's route.
// 2. You'd check if the route intersects any hotspot polygons.
// 3. const [alert, setAlert] = useState('');
// 4. if (intersects) { setAlert('Warning: High-accident zone ahead!'); }
// 5. <AlertPopup message={alert} />

export default AlertPopup;