import cors from 'cors';

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://confera-gamma.vercel.app'
];

const corsOptions = {
  origin: (origin, callback) => {

    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin) || (process.env.FRONTEND_URL && process.env.FRONTEND_URL === origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

export const corsMiddleware = cors(corsOptions);
