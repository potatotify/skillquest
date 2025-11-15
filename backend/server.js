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

// Connect to MongoDB
connectDB();

// Middleware - CORS
app.use(cors({
  origin: [
    'https://skillquest-neon.vercel.app',  // ✅ Your production frontend
    'http://localhost:5173',               // Local development
    'http://localhost:3000'                // Alternative local port
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware - JSON parsing
app.use(express.json());

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Error handler middleware
app.use(errorHandler);

// Root route - API status
app.get('/', (req, res) => {
  res.json({ 
    message: 'IFA SkillQuest API is running!',
    status: 'OK',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      users: '/api/users',
      profiles: '/api/profiles',
      assessments: '/api/assessments',
      leaderboard: '/api/leaderboard'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Route ${req.url} not found`,
    availableRoutes: ['/api/users', '/api/profiles', '/api/assessments', '/api/leaderboard']
  });
});

const PORT = process.env.PORT || 5000;

// Listen only in development mode
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

// Export for Vercel serverless
export default app;
