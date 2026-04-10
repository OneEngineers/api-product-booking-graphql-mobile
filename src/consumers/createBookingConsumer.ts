import amqp from 'amqplib';
import { BookingService } from '../services/bookingService';
import { debug, sendToQueue } from '../utils';
import {
  MESSAGE_KEY,
  EXCHANGE_QUEUE_MESSAGE_KEY,
  QUEUE_TYPE,
  BOOKING_STATUS,
} from '../constants';

const createBookingConsumer = async (channel: amqp.Channel) => {
  try {
    channel.assertExchange(
      MESSAGE_KEY.SABAY_ONE_USER_BOOKING_CREATE,
      QUEUE_TYPE.FANOUT,
      { durable: true }
    );
    console.log('consol log chanel:', channel);
    const assertQueue = await channel.assertQueue(
      EXCHANGE_QUEUE_MESSAGE_KEY.SABAY_ONE_USER_BOOKING_CREATE_QUEUE,
      { exclusive: false }
    );

    if (assertQueue.queue) {
      channel.prefetch(1);
      channel.bindQueue(
        assertQueue.queue,
        MESSAGE_KEY.SABAY_ONE_USER_BOOKING_CREATE,
        ''
      );

      channel.consume(
        assertQueue.queue,
        async (msg: amqp.ConsumeMessage | null) => {
          if (!msg) return;
          const data = JSON.parse(msg.content.toString());
          const { bookingId } = data;
          if (bookingId) {
            const bookingService = new BookingService();

            const checkBooking = await bookingService.getBookingById(bookingId);
            if (!checkBooking) {
              debug(`Booking not found: ${bookingId}`);
              return;
            }
            if (checkBooking.status !== BOOKING_STATUS.Open) {
              debug(`Booking ${bookingId} is not open`);
              return;
            }
            // Approve the booking
            const approvedBooking = await bookingService.updateBookingStatus(
              bookingId,
              BOOKING_STATUS.Approved
            );

            // Trigger microservices on booking approval
            try {
              const approvalMessage = {
                bookingId: approvedBooking._id,
                userId: approvedBooking.user_id,
                totalAmount: approvedBooking.total_amount,
                status: approvedBooking.status,
                approvedAt: new Date().getTime(),
              };

              // Send approval notification to other microservices
              await sendToQueue(
                MESSAGE_KEY.SABAY_ONE_USER_BOOKING_APPROVED,
                JSON.stringify(approvalMessage)
              );

              debug(
                `Booking approval notification sent for bookingId: ${bookingId}`
              );
            } catch (error) {
              debug(`Error sending booking approval notification: ${error}`);
            }
          }
        },
        { noAck: true }
      );
    }
  } catch (error) {
    console.log('queue consumer error: ', error);
  }
};

export default createBookingConsumer;
