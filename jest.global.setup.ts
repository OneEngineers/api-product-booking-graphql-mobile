import { getModelForClass } from '@typegoose/typegoose';
import { connectDB } from './src/configs';
import { HistoryLog } from './src/entities';
import { historyLog } from './src/test/mock';

const HistoryLogModel = getModelForClass(HistoryLog);

export default async () => {
  await connectDB();
  await HistoryLogModel.deleteMany({});

  await HistoryLogModel.insertMany(historyLog);
};
