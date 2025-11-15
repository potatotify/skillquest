import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './server/config/db.js';
import userRoutes from './server/routes/users.js';
import profileRoutes from './server/routes/profiles.js';
import assessmentRoutes from './server/routes/assessments.js';
import leaderboardRoutes from './server/routes/leaderboard.js';
import errorHandler from './server/middleware/errorHandler.js';

dotenv.config();

const app = express();

// Connect to MongoDB once
let isConnected = false;
const initDB = async () => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
};

// Initialize DB
initDB();

// CORS - Allow everything for Vercel
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.header(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  next();
});

app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'IFA SkillQuest API is running!',
    status: 'OK',
    routes: {
      users: '/api/users',
      profiles: '/api/profiles',
      assessments: '/api/assessments',
      leaderboard: '/api/leaderboard'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Route ${req.url} not found`,
    url: req.url,
    method: req.method
  });
});

// Error handler
app.use(errorHandler);

// Export for Vercel
export default app;
