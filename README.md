# SafeRushh 🚗💨

SafeRushh is an intelligent driver assistance platform designed to enhance safety and efficiency for ride-sharing and delivery drivers. It provides real-time insights into high-demand areas, accident-prone zones, and optimal routing with a focus on safety.

## Features ✨

- **Intelligent Heatmaps**: Visualize real-time customer demand to maximize earnings.
- **Safety First**: Real-time alerts when entering accident-prone zones.
- **Smart Simulation**: High-fidelity ride simulation with POV camera tracking.
- **Proximity Alerts**: Toast notifications when approaching your destination.
- **Seamless Auth**: Secure JWT-based authentication for drivers.

## Tech Stack 🛠️

- **Frontend**: React, Google Maps API (@vis.gl/react-google-maps), Axios, React Hot Toast.
- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT.
- **Styling**: Modern CSS with dark mode aesthetics.

## Getting Started 🚀

### Prerequisites
- Node.js & npm
- MongoDB Atlas account
- Google Maps API Key (with Maps JavaScript API, Directions API, and Geometry Library enabled)

### Installation

1. **Clone the repo**
   ```bash
   git clone https://github.com/yourusername/SafeRushh.git
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Create a .env file based on the provided environment variables
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   # Create a .env file with your Google Maps API Key
   npm run dev
   ```

## Environment Variables 🔑

### Backend (.env)
- `PORT`: Server port (e.g., 5001)
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Your secret key
- `CORS_ORIGIN`: Frontend URL (e.g., http://localhost:3000)

### Frontend (.env)
- `REACT_APP_GOOGLE_MAPS_API_KEY`: Your Google Maps API Key
- `REACT_APP_API_URL`: Backend URL (e.g., http://localhost:5001)

## License 📄
This project is licensed under the MIT License.
