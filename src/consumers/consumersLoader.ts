import amqp from 'amqplib';
import updatePurchaseStatusConsumer from './updatePurchaseStatusConsumer';
import updateBookingStatusConsumer from './updateBookingStatusConsumer';
const consumerLoader = async (channel: amqp.Channel) => {
  updatePurchaseStatusConsumer(channel);
  updateBookingStatusConsumer(channel);
  console.log('Consumer is ready');
};

export default consumerLoader;
