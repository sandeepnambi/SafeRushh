import dotenv from 'dotenv';
dotenv.config(); // ensure env is loaded

const allowedOrigins = [
  process.env.CORS_ORIGIN,
  'http://localhost:5173' // optional extra
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`❌ CORS blocked request from: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

export default corsOptions;
