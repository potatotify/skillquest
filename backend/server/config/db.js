import mongoose from 'mongoose';

const connectDB = async () => {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    console.warn('⚠️  MONGODB_URI is not defined in environment. Skipping MongoDB connection.');
    console.warn('Create a `.env` file with `MONGODB_URI` to enable DB connection.');
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB Atlas connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

export default connectDB;
