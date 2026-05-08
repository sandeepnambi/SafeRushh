// --- server.js ---
import dotenv from 'dotenv';
dotenv.config(); // <-- MOVED to the very top. This MUST be first.

import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import corsOptions from './middleware/corsOptions.js';

// Import route files
import authRoutes from './routes/authRoutes.js';
import apiRoutes from './routes/apiRoutes.js';

// (dotenv.config() is no longer here)

// Connect to database
connectDB();

const app = express();

// --- THIS IS THE CORRECT CORS FIX ---
// We only need this one line.
// It works now because dotenv.config() is at the top.
app.use(cors(corsOptions));

// (The app.options line has been DELETED as it was causing a crash)

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Mount routers
app.use('/api/users', authRoutes);
app.use('/api', apiRoutes);

// Simple test route
app.get('/', (req, res) => {
  res.send('SafeRushh API is running...');
});

// This will now correctly read '5001' from your .env file
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
