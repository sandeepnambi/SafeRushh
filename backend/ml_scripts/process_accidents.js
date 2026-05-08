// --- ml_scripts/process_accidents.js ---
/*
  HOW TO USE:
  1. Make sure your backend server is NOT running.
  2. Make sure your .env file has the correct MONGO_URI.
  3. Run this script from your /backend folder:
  node ml_scripts/process_accidents.js
  4. It will read the CSV, create hotspots, and save them to MongoDB.
  5. You only need to do this ONE time.
*/
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import AccidentHotspot from '../models/AccidentHotspot.js';
import connectDB from '../config/db.js';

dotenv.config();
// Simple clustering function
function findClusters(points, radiusKm = 0.5) {
  const clusters = [];
  
  // Convert radius from km to degrees (approx)
  const radiusDeg = radiusKm / 111; 

  for (const point of points) {
    let foundCluster = false;
    for (const cluster of clusters) {
      const dist = Math.sqrt(
        Math.pow(point.latitude - cluster.centerLat, 2) +
        Math.pow(point.longitude - cluster.centerLon, 2)
      );

      if (dist < radiusDeg) {
        // Add to existing cluster
        cluster.points.push(point);
        // Recalculate center
        cluster.centerLat = cluster.points.reduce((sum, p) => sum + p.latitude, 0) / cluster.points.length;
        cluster.centerLon = cluster.points.reduce((sum, p) => sum + p.longitude, 0) / cluster.points.length;
        foundCluster = true;
        break;
      }
    }

    if (!foundCluster) {
      // Create new cluster
      clusters.push({
        centerLat: point.latitude,
        centerLon: point.longitude,
        points: [point],
      });
    }
  }
  return clusters;
}

const importData = async () => {
  try {
    await connectDB();
    
    // Clear existing data
    await AccidentHotspot.deleteMany();
    console.log('Cleared existing hotspots...');

    // Load CSV
    const __dirname = path.resolve(path.dirname(''));
// This is the CORRECT line
  const dataPath = path.join(__dirname, 'data', 'accidents_vijayawada.csv');    const fileContent = fs.readFileSync(dataPath, 'utf8');

    const allPoints = fileContent
      .split('\n')
      .slice(1) // remove header
      .map(row => {
        const [lat, lon] = row.split(',');
        if (!lat || !lon) return null;
        return { latitude: parseFloat(lat), longitude: parseFloat(lon) };
      })
      .filter(Boolean);

    console.log(`Loaded ${allPoints.length} accident points.`);

    // Find clusters
    const clusters = findClusters(allPoints);
    console.log(`Found ${clusters.length} distinct hotspots.`);

    const hotspotsToSave = clusters.map((cluster, index) => ({
      name: `Hotspot ${index + 1} (Vijayawada)`,
      latitude: cluster.centerLat,
      longitude: cluster.centerLon,
      radius: 150, // 150-meter radius
      dangerLevel: Math.min(5, Math.ceil(cluster.points.length / 3)), // Danger 1-5
    }));

    await AccidentHotspot.insertMany(hotspotsToSave);
    
    console.log('Successfully imported hotspots to database!');
    process.exit();
  } catch (error) {
    console.error(`Error processing data: ${error.message}`);
    process.exit(1);
  }
};

importData();