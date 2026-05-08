// --- controllers/demandController.js ---
import fs from 'fs';
import path from 'path';

// @desc    Get simulated demand heatmap
// @route   GET /api/demand-heatmap
// @access  Private (Protected)
const getDemandHeatmap = async (req, res) => {
  try {
    // In a real app, you'd run a KNN model here based on the user's
    // current time and location (req.query.lat, req.query.lon).

    // For this project, we will read our mock ride history
    // and return it as a "heatmap". This is more than enough for a demo.
    
    // Construct the path to the CSV file
    const __dirname = path.resolve(path.dirname(''));
    const dataPath = path.join(__dirname, 'data', 'ride_history_vijayawada.csv');

    const fileContent = fs.readFileSync(dataPath, 'utf8');
    
    const heatmapData = fileContent
      .split('\n') // Split by line
      .slice(1) // Remove header row
      .map(row => {
        const [lat, lon, hour] = row.split(',');
        if (!lat || !lon) return null;
        
        // We'll give each point a "weight" for the heatmap
        // e.g., evening hours are "heavier"
        const weight = (parseInt(hour) > 16) ? 1.0 : 0.5;
        
        return {
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
          weight: weight
        };
      })
      .filter(Boolean); // Filter out any null/empty rows

    res.json(heatmapData);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

export { getDemandHeatmap };