import { connectAmqp } from '../configs';
import { QUEUE_TYPE } from '../constants';

export const sendToQueue = async (messageKey: string, payload: string) => {
  const channel = await connectAmqp();
  await channel.assertQueue(messageKey, {
    durable: true,
  });
  await channel.sendToQueue(messageKey, Buffer.from(payload), {
    persistent: true, // make sure queue won't be lost even if RabbitMQ restarts
  });
};

export const sendToExchange = async (
  exchangeName: string,
  payload: string,
  exchangeType: string = QUEUE_TYPE.FANOUT,
  routingKey?: string
) => {
  const channel = await connectAmqp();
  await channel.assertExchange(
    exchangeName,
    exchangeType || QUEUE_TYPE.FANOUT,
    {
      durable: true,
    }
  );

  await channel.publish(exchangeName, routingKey || '', Buffer.from(payload), {
    persistent: true, // make sure queue won't be lost even if RabbitMQ restarts
  });
};
