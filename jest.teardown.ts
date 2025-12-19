import { getModelForClass } from '@typegoose/typegoose';
import mongoose from 'mongoose';
import { connectDB } from './src/configs';
import { HistoryLog } from './src/entities';

const HistoryLogModel = getModelForClass(HistoryLog);
export default async () => {
  await connectDB();

  await HistoryLogModel.deleteMany({});
  await mongoose.connection.close();
};
