// --- routes/apiRoutes.js ---
import express from 'express';
import { getHotspots } from '../controllers/hotspotController.js';
import { getDemandHeatmap } from '../controllers/demandController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// This route is protected. User must be logged in.
router.get('/hotspots', protect, getHotspots);

// This route is also protected.
router.get('/demand-heatmap', protect, getDemandHeatmap);

export default router;