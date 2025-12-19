import mongoose from 'mongoose';
import { ENV, ENVIRONMENT } from '../constants';
import { slackErrorMessage } from '../utils/slackUtil';

let isMongooseEventRegistered = false;
const DB_URI = `mongodb://${ENV.MONGO_DB_USERNAME}:${encodeURIComponent(
  ENV.MONGO_DB_PASSWORD
)}@${ENV.MONGO_DB_URI}`;

const connectDB = async (): Promise<void> => {
  try {
    console.log('Establishing connection to DB: ', ENV.MONGO_DB_URI);

    if (!isMongooseEventRegistered) {
      mongoose.connection.on('error', (error) => {
        if (
          ENV.NODE_ENV !== ENVIRONMENT.TEST &&
          ENV.NODE_ENV !== ENVIRONMENT.CI_TEST
        ) {
          console.log(
            `mongodb ${ENV.MONGO_DB_URI} connection error event`,
            error
          );
          mongoose.disconnect();
        }
      });

      mongoose.connection.on('connected', () => {
        if (
          ENV.NODE_ENV === ENVIRONMENT.TEST &&
          ENV.NODE_ENV === ENVIRONMENT.CI_TEST
        ) {
          console.log(`mongodb ${ENV.MONGO_DB_URI} connected event`);
        }
      });

      mongoose.connection.on('disconnected', () => {
        if (
          ENV.NODE_ENV !== ENVIRONMENT.TEST &&
          ENV.NODE_ENV !== ENVIRONMENT.CI_TEST
        ) {
          console.log(`mongodb ${ENV.MONGO_DB_URI} disconnected event`);
          setTimeout(
            async () => {
              await connectDB();
            },
            parseFloat(`${ENV.RETRY_INTERVAL}`)
          );
        }
      });
      isMongooseEventRegistered = true;
    }

    await mongoose.connect(DB_URI);

    console.log(`mongodb ${ENV.MONGO_DB_URI} connected`);
  } catch (error) {
    slackErrorMessage(error);
    console.log(`error make connection to mongodb ${ENV.MONGO_DB_URI}`);
  }
};

const dbStatus = (): string => {
  return mongoose.connection.readyState === 1 ? 'ok' : 'failed';
};

export { connectDB, dbStatus };
