import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './server/config/db.js'; // ✅ Fixed path
import userRoutes from './server/routes/users.js'; // ✅ Fixed path
import profileRoutes from './server/routes/profiles.js'; // ✅ Fixed path
import assessmentRoutes from './server/routes/assessments.js'; // ✅ Fixed path
import leaderboardRoutes from './server/routes/leaderboard.js'; // ✅ Fixed path
import errorHandler from './server/middleware/errorHandler.js'; // ✅ Fixed path

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: [
    'https://ifa-skillquest-9i2egeh7z-theajclub.vercel.app',
    'https://ifa-skillquest-ravs9e2lz-theajclub.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Error handler
app.use(errorHandler);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'IFA SkillQuest API is running!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
