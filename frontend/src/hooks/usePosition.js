import { useState, useEffect } from 'react';

export const usePosition = () => {
  // --- MODIFIED: Set default position to SRM AP ---
  const [position, setPosition] = useState({
    latitude: 16.4649,
    longitude: 80.5078,
  });
  const [heading, setHeading] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const geo = navigator.geolocation;
    if (!geo) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    // Start watching the user's position
    const watcher = geo.watchPosition(
      (pos) => {
        setPosition({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setHeading(pos.coords.heading);
        setError(null);
      },
      (err) => {
        setError(err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );

    // Cleanup function to stop watching when component unmounts
    return () => geo.clearWatch(watcher);
  }, []);

  return { position, heading, error };
};

