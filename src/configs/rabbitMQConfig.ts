import amqp from 'amqplib';
import { ENV, ENVIRONMENT } from '../constants';
import { slackErrorMessage } from '../utils/slackUtil';
import consumerLoader from '../consumers/consumersLoader';

const amqpConnectionURI =
  ENV.NODE_ENV === 'development'
    ? `amqp://${ENV.RABBITMQ_HOST}`
    : `amqp://${ENV.RABBITMQ_USER}:${ENV.RABBITMQ_PASSWORD}@${ENV.RABBITMQ_HOST}/${ENV.RABBITMQ_VHOST}`;

let connection: amqp.Connection;
let channel: amqp.Channel;
let isConnected = false;

const connectAmqp = async (): Promise<amqp.Channel | null> => {
  try {
    if (connection && channel && isConnected) return channel;
    connection = await amqp.connect(amqpConnectionURI);

    connection.on('close', () => {
      if (
        ENV.NODE_ENV !== ENVIRONMENT.TEST &&
        ENV.NODE_ENV !== ENVIRONMENT.CI_TEST
      ) {
        console.error(`${ENV.RABBITMQ_HOST} reconnecting`);
        isConnected = false;
        setTimeout(connectAmqp, Number(ENV.RETRY_INTERVAL));
      }
    });

    connection.on('error', () => {
      if (
        ENV.NODE_ENV !== ENVIRONMENT.TEST &&
        ENV.NODE_ENV !== ENVIRONMENT.CI_TEST
      ) {
        console.error(`${ENV.RABBITMQ_HOST} reconnecting`);
        isConnected = false;
        setTimeout(connectAmqp, Number(ENV.RETRY_INTERVAL));
      }
    });

    channel = await connection.createChannel();
    isConnected = true;
    console.log(`${ENV.RABBITMQ_HOST} connected`);

    if (global.execConsumerLoader) await consumerLoader(channel);

    return channel;
  } catch (error) {
    if (
      ENV.NODE_ENV !== ENVIRONMENT.TEST &&
      ENV.NODE_ENV !== ENVIRONMENT.CI_TEST
    ) {
      console.error(`${ENV.RABBITMQ_HOST} reconnecting`);
      setTimeout(connectAmqp, Number(ENV.RETRY_INTERVAL));
    }
    isConnected = false;
    slackErrorMessage(error);
    return null;
  }
};

const rabbitMqStatus = async (): Promise<string> => {
  try {
    const amqpConnection = await amqp.connect(amqpConnectionURI);
    amqpConnection.close();
    return 'ok';
  } catch (error) {
    slackErrorMessage(error); // Make sure the 'slackErrorMessage' function is defined or imported
    return 'failed';
  }
};

export { connectAmqp, rabbitMqStatus };
