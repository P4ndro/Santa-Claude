import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGODB_URL;
  
  if (!uri) {
    console.error('MONGODB_URL is not defined in environment variables');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
}

