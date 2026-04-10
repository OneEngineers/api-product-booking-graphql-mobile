import amqp from 'amqplib';
import updatePurchaseStatusConsumer from './updatePurchaseStatusConsumer';
import updateBookingStatusConsumer from './updateBookingStatusConsumer';
import createBookingConsumer from './createBookingConsumer';
import bookingApprovalNotificationConsumer from './bookingApprovalNotificationConsumer';
const consumerLoader = async (channel: amqp.Channel) => {
  updatePurchaseStatusConsumer(channel);
  updateBookingStatusConsumer(channel);
  createBookingConsumer(channel);
  bookingApprovalNotificationConsumer(channel);
  console.log('Consumer is ready');
};

export default consumerLoader;
