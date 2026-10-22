import mongoose from 'mongoose';

export async function connectDB(uri) {
  if (!uri) throw new Error('MONGO_URI is not set. Copy .env.example to .env and fill it in.');
  await mongoose.connect(uri);
  console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
}
