// --- models/AccidentHotspot.js ---
import mongoose from 'mongoose';

const accidentHotspotSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  // We will store the "danger zone" as a radius in meters
  radius: {
    type: Number,
    required: true,
    default: 150, // Default to a 150-meter radius
  },
  dangerLevel: {
    type: Number,
    required: true,
    default: 1, // A simple 1-5 scale, for example
  },
}, {
  timestamps: true,
});

const AccidentHotspot = mongoose.model('AccidentHotspot', accidentHotspotSchema);

export default AccidentHotspot;