import mongoose from 'mongoose';
import { connectDB } from './src/configs';

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await mongoose.connection.close();
});
