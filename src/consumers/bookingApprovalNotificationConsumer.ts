import amqp from 'amqplib';
import { debug } from '../utils';
import {
  MESSAGE_KEY,
  EXCHANGE_QUEUE_MESSAGE_KEY,
  QUEUE_TYPE,
} from '../constants';

/*
  Description: Handle booking approval notifications
  This consumer processes approval events and triggers related services
  @param object data: {
    string bookingId,
    number userId,
    number totalAmount,
    string status,
    number approvedAt
  }
*/

const bookingApprovalNotificationConsumer = async (channel: amqp.Channel) => {
  try {
    // Set up exchange and queue for booking approval notifications
    channel.assertExchange(
      MESSAGE_KEY.SABAY_ONE_USER_BOOKING_APPROVED,
      QUEUE_TYPE.FANOUT,
      { durable: true }
    );

    const assertQueue = await channel.assertQueue(
      EXCHANGE_QUEUE_MESSAGE_KEY.SABAY_ONE_USER_BOOKING_APPROVED_QUEUE,
      { exclusive: false }
    );

    if (assertQueue.queue) {
      channel.prefetch(1);
      channel.bindQueue(
        assertQueue.queue,
        MESSAGE_KEY.SABAY_ONE_USER_BOOKING_APPROVED,
        ''
      );

      channel.consume(
        assertQueue.queue,
        async (msg) => {
          try {
            const data = JSON.parse(msg.content.toString());
            const { bookingId, userId, totalAmount, status, approvedAt } = data;

            if (!bookingId || !userId) {
              debug('Invalid booking approval data');
              return;
            }

            debug(
              `Processing booking approval: bookingId=${bookingId}, userId=${userId}, status=${status}`
            );

            // TODO: Implement your business logic here
            // Examples:
            // 1. Send notification to user (email/SMS/push)
            // 2. Update user points/rewards
            // 3. Trigger inventory/availability update
            // 4. Log analytics event
            // 5. Call external microservices
            // 6. Update user dashboard

            // Example: Log the approval
            console.log('✓ Booking approved:', {
              bookingId,
              userId,
              totalAmount,
              status,
              approvedAt: new Date(approvedAt).toISOString(),
            });

            // Send acknowledgment
            channel.ack(msg);
          } catch (error) {
            debug(`Error processing booking approval: ${error}`);
            // Requeue message on error
            channel.nack(msg, false, true);
          }
        },
        { noAck: false } // Manual acknowledgment for reliability
      );

      debug('Booking approval notification consumer started');
    }
  } catch (error) {
    console.error('Booking approval notification consumer error:', error);
  }
};

export default bookingApprovalNotificationConsumer;
