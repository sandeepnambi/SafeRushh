/* global google */
import React, { useState, useEffect, useRef } from 'react';
import {
  APIProvider,
  Map,
  useMap,
  Marker,
  AdvancedMarker,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import toast from 'react-hot-toast';
import apiClient from '../api/apiClient';
import { usePosition } from '../hooks/usePosition';

// === Google Maps Components ===

// --- Car Icon Component ---
const CarIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{
      transform: 'translate(-12px, -12px)', // Center the icon
      filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.3))', // Nice shadow
    }}
  >
    <path
      d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H6.5C5.84 5 5.28 5.42 5.08 6.01L3 12V19C3 19.55 3.45 20 4 20H5C5.55 20 6 19.55 6 19V18H18V19C18 19.55 18.45 20 19 20H20C20.55 20 21 19.55 21 19V12L18.92 6.01ZM6.85 7H17.15L18.31 10H5.69L6.85 7ZM19 16H5V12H19V16Z"
      fill="#1A73E8"
    />
    <path d="M7.5 14C6.67 14 6 14.67 6 15.5C6 16.33 6.67 17 7.5 17C8.33 17 9 16.33 9 15.5C9 14.67 8.33 14 7.5 14Z" fill="#1A73E8" />
    <path d="M16.5 14C15.67 14 15 14.67 15 15.5C15 16.33 15.67 17 16.5 17C17.33 17 18 16.33 18 15.5C18 14.67 17.33 14 16.5 14Z" fill="#1A73E8" />
  </svg>
);


// Component to render individual demand points with different colors
const DemandPointsComponent = ({ data }) => {
  if (!data) return null;

  // This function decides the color of the dot
  const getDotColor = (weight) => {
    if (weight < 0.6) return '#00E676'; // Green (low demand)
    if (weight < 0.9) return '#FFEA00'; // Yellow (medium demand)
    return '#FF1744'; // Red (high demand)
  };

  return (
    <>
      {data.map((item, index) => (
        <AdvancedMarker
          key={index}
          position={{ lat: item.latitude, lng: item.longitude }}
        >
          {/* This is the dot */}
          <div style={{
            width: '10px', 
            height: '10px',
            backgroundColor: getDotColor(item.weight),
            borderRadius: '50%',
            border: '1px solid black', // Add a border to make them stand out
            opacity: 0.8
          }} />
        </AdvancedMarker>
      ))}
    </>
  );
};


// Component to render the Accident Hotspot Circles
const HotspotsComponent = ({ data }) => {
  const map = useMap();
  const circlesRef = useRef([]);

  useEffect(() => {
    if (!map || !data) return;

    circlesRef.current.forEach(circle => circle.setMap(null));
    circlesRef.current = [];
    
    const newCircles = data.map(hotspot => {
      return new google.maps.Circle({
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.2,
        map: map,
        center: { lat: hotspot.latitude, lng: hotspot.longitude },
        radius: 150 
      });
    });

    circlesRef.current = newCircles;
    
    return () => {
      circlesRef.current.forEach(circle => circle.setMap(null));
      circlesRef.current = [];
    };
  }, [map, data]);

  return null;
};

// Component to fetch and render the route
const RouteComponent = ({ start, end, onRouteFetched }) => {
  const map = useMap();
  const routes = useMapsLibrary('routes');
  
  const directionsServiceRef = useRef(null);
  const directionsRendererRef = useRef(null);

  // 1. Initialize the Directions Service and Renderer
  useEffect(() => {
    if (!map || !routes) return;
    
    if (!directionsServiceRef.current) {
      directionsServiceRef.current = new google.maps.DirectionsService();
    }

    if (!directionsRendererRef.current) {
      directionsRendererRef.current = new google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#007bff',
          strokeOpacity: 0.8,
          strokeWeight: 6
        }
      });
    }

    return () => {
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
        directionsRendererRef.current = null;
      }
    };
  }, [map, routes]);

  // 2. Fetch directions when start or end points change
  useEffect(() => {
    if (!map || !directionsServiceRef.current || !directionsRendererRef.current || !start || !end) {
      return;
    }

    directionsRendererRef.current.setMap(map);
    
    const request = {
      origin: { lat: start.latitude, lng: start.longitude },
      destination: { lat: end.latitude, lng: end.longitude },
      travelMode: google.maps.TravelMode.DRIVING
    };

    directionsServiceRef.current.route(request, (result, status) => {
      if (status === 'OK') {
        directionsRendererRef.current.setDirections(result);
        onRouteFetched(result); // Pass the result to the parent
      } else {
        console.error(`Error fetching directions: ${status}`);
        
        // --- NEW: Mock Route Logic for Billing Errors ---
        // If billing is not enabled, we create a simple straight-line "mock" route 
        // so the user can still see the car move and test the app.
        const mockResult = {
          routes: [{
            overview_path: [
              new google.maps.LatLng(start.latitude, start.longitude),
              new google.maps.LatLng(end.latitude, end.longitude)
            ],
            legs: [{
              distance: { value: 1000, text: '1 km' },
              duration: { value: 60, text: '1 min' }
            }]
          }]
        };
        
        toast.error('Directions API denied (Billing required). Using Mock Route.', { id: 'billing-error' });
        onRouteFetched(mockResult); 
        
        if (directionsRendererRef.current) {
          directionsRendererRef.current.setDirections({routes: []});
        }
      }
    });

  }, [map, start, end, onRouteFetched]);

  return null;
};

// --- NEW: Legend Component ---
const Legend = () => (
  <div style={{
    position: 'absolute',
    top: '70px', // Below the logout button (which is at top: 20px)
    right: '10px',
    background: 'white',
    borderRadius: '8px',
    padding: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    zIndex: 10,
    fontFamily: 'Arial, sans-serif',
    fontSize: '14px',
    width: '220px' // Give it a fixed width
  }}>
    <h4 style={{ margin: '0 0 10px 0', padding: '0', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Map Legend</h4>
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
      <div style={{ width: '15px', height: '15px', backgroundColor: '#FF1744', borderRadius: '50%', border: '1px solid black', marginRight: '8px', flexShrink: 0 }} />
      <span>High Customer Demand</span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
      <div style={{ width: '15px', height: '15px', backgroundColor: '#FFEA00', borderRadius: '50%', border: '1px solid black', marginRight: '8px', flexShrink: 0 }} />
      <span>Medium Customer Demand</span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
      <div style={{ width: '15px', height: '15px', backgroundColor: '#00E676', borderRadius: '50%', border: '1px solid black', marginRight: '8px', flexShrink: 0 }} />
      <span>Low Customer Demand</span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div style={{ width: '15px', height: '15px', backgroundColor: 'rgba(255, 0, 0, 0.2)', borderRadius: '50%', border: '2px solid rgba(255, 0, 0, 0.8)', marginRight: '8px', flexShrink: 0 }} />
      <span>Accident-Prone Zone</span>
    </div>
  </div>
);

// --- NEW: Alert Popup Component ---
const AlertPopup = ({ message }) => {
  if (!message) return null;
  
  return (
    <div style={{
      position: 'absolute',
      top: '10px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 20,
      padding: '12px 20px',
      background: message.type === 'danger' ? '#d93025' : '#f29900', // Red for danger, Orange/Yellow for traffic
      color: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      fontSize: '16px',
      fontWeight: '600',
      textAlign: 'center',
      border: '2px solid white'
    }}>
      {message.type === 'danger' ? '⚠️' : '🚦'} {message.message}
    </div>
  );
};

// === End Google Maps Components ===


// --- MainMap component is now just the provider ---
function MainMap() {
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return <div className="error-message" style={{padding: '20px'}}>API Key for Google Maps is missing.</div>
  }

  return (
    // Pre-load the 'routes' and 'geometry' libraries
    <APIProvider apiKey={apiKey} libraries={['routes', 'geometry']}>
      <MapContent />
    </APIProvider>
  );
}


// --- All logic is moved into this child component ---
function MapContent() {
  const { position, heading } = usePosition();
  // --- Load the 'geometry' library ---
  const geometry = useMapsLibrary('geometry');
  // --- State to track if geometry library is loaded ---
  const [isGeometryLoaded, setIsGeometryLoaded] = useState(false);
  
  const [viewState, setViewState] = useState({
    // --- UPDATED: Default center to SRM AP ---
    center: { lat: 16.4649, lng: 80.5078 }, 
    zoom: 15,
    tilt: 0,
    heading: 0,
  });
  
  const [hotspotData, setHotspotData] = useState(null);
  const [demandData, setDemandData] = useState(null);
  const [apiError, setApiError] = useState('');
  const [route, setRoute] = useState(null);
  const [destination, setDestination] = useState(null);
  // --- NEW: Alert Message State ---
  const [alertMessage, setAlertMessage] = useState(null);

  // --- Simulation States ---
  const [directionsResult, setDirectionsResult] = useState(null);
  const [simulationState, setSimulationState] = useState('stopped'); // 'stopped', 'running', 'paused'
  const [carPosition, setCarPosition] = useState(null);
  const animationFrameRef = useRef(null);
  const animationStartTimeRef = useRef(null);
  const routePathRef = useRef([]);
  const routeDistanceRef = useRef(0);
  const lastElapsedRef = useRef(0);
  const toastShownRef = useRef({ near: false, arrived: false });

  // --- Watch geometry library ---
  useEffect(() => {
    if (geometry) {
      setIsGeometryLoaded(true);
    }
  }, [geometry]);

  // 1. Fetch data from our backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setApiError('');
        const [hotspotRes, demandRes] = await Promise.all([
          apiClient.get('/api/hotspots'),
          apiClient.get('/api/demand-heatmap')
        ]);
        
        setHotspotData(hotspotRes.data); 
        setDemandData(demandRes.data.map(item => ({...item})));
        
      } catch (err) {
        console.error('Failed to fetch map data:', err);
        setApiError('Could not load map data. Please check connection.');
      }
    };
    fetchData();
  }, []);

  // --- NEW: Helper function for checking hotspot collision ---
  const checkHotspotCollision = (currentPoint) => {
    if (!currentPoint || !geometry) {
      return { type: null, message: null };
    }

    const driverLatLng = new google.maps.LatLng(currentPoint.lat, currentPoint.lng);

    // 1. Check Accident Hotspots (Red Circles)
    if (hotspotData) {
      for (const hotspot of hotspotData) {
        const hotspotCenter = new google.maps.LatLng(hotspot.latitude, hotspot.longitude);
        const distance = geometry.spherical.computeDistanceBetween(driverLatLng, hotspotCenter);

        if (distance <= hotspot.radius) {
          return { type: 'danger', message: "DANGER: Accident-Prone Zone! Drive carefully." };
        }
      }
    }

    // 2. Check High Demand / Traffic Areas (Red Dots)
    if (demandData) {
      for (const demand of demandData) {
        // Only check high demand (red) dots
        if (demand.weight > 0.8) {
          const demandPoint = new google.maps.LatLng(demand.latitude, demand.longitude);
          const distance = geometry.spherical.computeDistanceBetween(driverLatLng, demandPoint);

          // If within 100 meters of a high-demand point, it's a traffic zone
          if (distance <= 100) {
            return { type: 'traffic', message: "High Traffic Area: Expect delays." };
          }
        }
      }
    }

    return { type: null, message: null };
  };
  
  // 2. Update map camera when GPS position changes
  useEffect(() => {
    // Only follow GPS if simulation is fully stopped and car is not on map.
    if (position && simulationState === 'stopped' && !carPosition) {
      setViewState(prev => ({
        ...prev,
        center: { lat: position.latitude, lng: position.longitude },
        zoom: 18,
        tilt: 45,
        heading: heading || 0,
      }));

      // --- NEW: Check for hotspot/traffic collision on real GPS move ---
      const alert = checkHotspotCollision({ lat: position.latitude, lng: position.longitude });
      setAlertMessage(alert.message ? alert : null);
    }
  }, [position, heading, simulationState, carPosition, hotspotData, geometry]); // <-- Added dependencies

  // 3. Map Click Handler
  const handleMapClick = (evt) => {
    // Use car's position if it exists, otherwise use real GPS.
    const startPoint = carPosition 
      ? { latitude: carPosition.lat, longitude: carPosition.lng } 
      : position;
      
    if (!startPoint) return; // Don't do anything if we have no location at all

    // Stop any running simulation
    cancelSimulation(); // This will stop the animation loop

    const newDestination = evt.detail.latLng;
    setDestination({
      latitude: newDestination.lat,
      longitude: newDestination.lng
    });
    
    // Set the route using the new startPoint
    setRoute({
      start: startPoint,
      end: { latitude: newDestination.lat, longitude: newDestination.lng }
    });
  };

  // 4. Cancel Simulation Function
  const cancelSimulation = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    // Don't set carPosition to null here, so it stays at the destination
    setSimulationState('stopped');
    animationStartTimeRef.current = null;
    routePathRef.current = [];
    routeDistanceRef.current = 0;
    lastElapsedRef.current = 0; // Reset pause time
    toastShownRef.current = { near: false, arrived: false };
  };

  // 5. Handle Start/Pause/Resume Button
  const handleSimulationButton = () => {
    if (simulationState === 'running') {
      // --- PAUSE LOGIC ---
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
      // Store how long the animation has been running
      lastElapsedRef.current = performance.now() - animationStartTimeRef.current;
      setSimulationState('paused');

    } else if (simulationState === 'paused') {
      // --- RESUME LOGIC ---
      // Adjust start time to account for the pause
      animationStartTimeRef.current = performance.now() - lastElapsedRef.current;
      setSimulationState('running');
      animationFrameRef.current = requestAnimationFrame(animateStep);

    } else if (simulationState === 'stopped') {
      // --- START LOGIC ---
      if (!directionsResult || !geometry) return;
      const path = directionsResult.routes[0].overview_path;
      if (!path || path.length === 0) return;
      
      routeDistanceRef.current = geometry.spherical.computeLength(path);
      routePathRef.current = path;
      lastElapsedRef.current = 0; // Reset pause time
      animationStartTimeRef.current = performance.now();
      setSimulationState('running');
      setCarPosition({ lat: path[0].lat(), lng: path[0].lng() });
      animationFrameRef.current = requestAnimationFrame(animateStep);
    }
  };
  
  // 6. Animation Step Function
  const animateStep = (timestamp) => {
    // Check geometry library
    if (!geometry) {
      cancelSimulation();
      return;
    }

    const simulationDuration = 30000; // 30 seconds for the whole trip
    const path = routePathRef.current;
    const totalDistance = routeDistanceRef.current;
    
    if (totalDistance === 0) { // Safety check
      cancelSimulation();
      return;
    }

    const elapsedTime = timestamp - animationStartTimeRef.current;
    let progress = elapsedTime / simulationDuration;
    let currentCarPos; // To store the car's position for collision check

    if (progress >= 1) {
      // --- MODIFIED: Animation finished ---
      currentCarPos = { lat: path[path.length - 1].lat(), lng: path[path.length - 1].lng() };
      setCarPosition(currentCarPos);
      
      // Stop the loop but DON'T clear the car
      cancelAnimationFrame(animationFrameRef.current); 
      animationFrameRef.current = null;
      setSimulationState('stopped'); // Go back to 'stopped' state
      lastElapsedRef.current = 0;
      
      if (!toastShownRef.current.arrived) {
        toast.success('You have arrived at your destination!', { duration: 5000, icon: '🏁' });
        toastShownRef.current.arrived = true;
      }
      
    } else {
      // --- Smooth Interpolation Logic ---
      const distanceToTravel = progress * totalDistance;
      let traveledDistance = 0;
      
      // Find the two points on the path we are between
      for (let i = 0; i < path.length - 1; i++) {
        const p1 = path[i];
        const p2 = path[i+1];
        const segmentDistance = geometry.spherical.computeDistanceBetween(p1, p2);

        if (traveledDistance + segmentDistance >= distanceToTravel) {
          // This is our segment. Find how far along we are.
          const fraction = (distanceToTravel - traveledDistance) / segmentDistance;
          
          // 1. Get the new interpolated point (SMOOTH MOVEMENT)
          const currentPoint = geometry.spherical.interpolate(p1, p2, fraction);
          currentCarPos = { lat: currentPoint.lat(), lng: currentPoint.lng() };
          setCarPosition(currentCarPos);

          // 2. Get the heading for the POV (POINT OF VIEW)
          const heading = geometry.spherical.computeHeading(p1, p2);
          
          // 3. Update the map camera
          setViewState(prev => ({
            ...prev,
            center: { lat: currentPoint.lat(), lng: currentPoint.lng() },
            heading: heading,
            tilt: 60, // <-- Increased tilt for "POV"
            zoom: 18
          }));
          
          break; // Exit loop, we've found our point
        }
        
        traveledDistance += segmentDistance;
      }

      // --- NEW: Proximity Toast Logic ---
      const remainingDistance = totalDistance - traveledDistance;
      if (remainingDistance < 200 && !toastShownRef.current.near) {
        toast('Approaching destination (200m)', { icon: '📍' });
        toastShownRef.current.near = true;
      }
    }

    // --- NEW: Check for hotspot/traffic collision on every frame ---
    const alert = checkHotspotCollision(currentCarPos);
    setAlertMessage(alert.message ? alert : null);

    // Request the next frame (if not finished)
    if (progress < 1) {
      animationFrameRef.current = requestAnimationFrame(animateStep);
    }
  };

  return (
    <div className="map-container">
      {apiError && <div className="error-message" style={{position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 10}}>{apiError}</div>}
      
      {/* --- RENDER THE LEGEND --- */}
      <Legend />

      {/* --- RENDER THE ALERT --- */}
      <AlertPopup message={alertMessage} />

      {/* --- UNIFIED SIMULATION BUTTON (START/PAUSE/RESUME) --- */}
      {directionsResult && (
        <button 
          onClick={handleSimulationButton}
          disabled={!isGeometryLoaded} // <-- Check if library is loaded
          style={{
            position: 'absolute',
            bottom: '30px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: 'bold',
            color: 'white',
            // --- UPDATED: Button color changes based on state ---
            background: !isGeometryLoaded 
              ? '#9E9E9E' // Grey (Loading)
              : (simulationState === 'running' ? '#FFC107' : '#00E676'), // Yellow (Pause) or Green (Start/Resume)
            border: 'none',
            borderRadius: '30px',
            cursor: isGeometryLoaded ? 'pointer' : 'not-allowed', // <-- Visual feedback
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            minWidth: '220px' // Give a consistent width
          }}
        >
          {/* --- UPDATED: Button text changes based on state --- */}
          {!isGeometryLoaded 
            ? 'Loading Libraries...' 
            : (simulationState === 'running' 
                ? 'PAUSE SIMULATION' 
                : (simulationState === 'paused' ? 'RESUME SIMULATION' : 'START SIMULATION')
              )
          }
        </button>
      )}
      
      <Map
        {...viewState}
        onCameraChanged={evt => setViewState(evt.detail)}
        mapId={'saferushh-map-v1'}
        onClick={handleMapClick}
        disableDefaultUI={true}
        gestureHandling={'greedy'}
        tilt={viewState.tilt}
        heading={viewState.heading}
      >
        {/* 1. Driver's Live Location Marker (Hide if car is on map) */}
        {position && !carPosition && (
          <AdvancedMarker
            position={{ lat: position.latitude, lng: position.longitude }}
          >
            {/* Simple blue dot for driver */}
            <div style={{
              width: 20, 
              height: 20, 
              background: '#007bff', 
              borderRadius: '50%',
              border: '3px solid white',
              boxShadow: '0 0 10px rgba(0,123,255,0.5)'
            }} />
          </AdvancedMarker>
        )}

        {/* --- Car Simulation Marker (SIMPLIFIED LOGIC) --- */}
        {carPosition && (
           <AdvancedMarker position={carPosition}>
            <CarIcon />
          </AdvancedMarker>
        )}

        {/* 2. Destination Marker */}
        {destination && (
          <AdvancedMarker
            position={{ lat: destination.latitude, lng: destination.longitude }}
          />
        )}

        {/* 3. Demand Points - ENABLED AS REQUESTED */}
        <DemandPointsComponent data={demandData} />


        {/* 4. Accident Hotspot Circles */}
        <HotspotsComponent data={hotspotData} />

        {/* 5. Route Line */}
        {route && (
          <RouteComponent 
            start={route.start} 
            end={route.end} 
            onRouteFetched={setDirectionsResult} // <-- Pass the callback
          />
        )}

      </Map>
    </div>
  );
}

export default MainMap;

