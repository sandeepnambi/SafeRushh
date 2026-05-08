// --- src/api/apiClient.js ---
import axios from 'axios';

// Create an Axios instance
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // e.g., 'http://localhost:5000'
  headers: {
    'Content-Type': 'application/json',
  },
});

/* This is an "interceptor". It automatically adds the
  JWT token to the header of EVERY request after you log in.
*/
apiClient.interceptors.request.use(
  (config) => {
    // Get user info from local storage
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    
    if (userInfo && userInfo.token) {
      config.headers['Authorization'] = `Bearer ${userInfo.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;