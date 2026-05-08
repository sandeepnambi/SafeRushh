// --- controllers/hotspotController.js ---
import AccidentHotspot from '../models/AccidentHotspot.js';

// @desc    Get all accident hotspots
// @route   GET /api/hotspots
// @access  Private (Protected)
const getHotspots = async (req, res) => {
  try {
    // This is a simple fetch. All the hard work (clustering)
    // was done by our one-time 'process_accidents.js' script.
    const hotspots = await AccidentHotspot.find({});
    res.json(hotspots);
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

export { getHotspots };