import { connectAmqp, connectDB } from '../configs';

const startConsumers = async () => {
  try {
    global.execConsumerLoader = true;
    await connectDB();
    await connectAmqp();
  } catch (error) {
    console.log('consumers error: ', error);
  }
};

startConsumers();
