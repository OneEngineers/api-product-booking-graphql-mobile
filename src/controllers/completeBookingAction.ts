import moment from 'moment';
import {
  RESPONSE_CODE,
  RESPONSE_STATUS,
  BOOKING_STATUS,
  MESSAGE_KEY,
} from '../constants';
import { BookingService } from '../services/bookingService';
import { debug, sendToQueue } from '../utils';
import { AdminApprovalResponse } from '../graphql/typeDefs/bookingTypeDefs';

const completeBookingAction = async (
  input: { bookingId: string },
  user: { mysabayUserID?: number }
): Promise<AdminApprovalResponse> => {
  const { bookingId } = input;
  if (!user?.mysabayUserID) {
    return {
      code: RESPONSE_CODE.UNAUTHORIZED,
      status: 'Unauthorized',
    };
  }
  try {
    const bookingService = new BookingService();

    // Get booking details first
    const booking = await bookingService.getBookingById(bookingId);
    if (!booking) {
      return {
        code: RESPONSE_CODE.NOT_FOUND_INPUT,
        status: RESPONSE_STATUS.FAILED,
        message: 'Booking not found',
      };
    }

    // Check if booking is approved
    if (booking.status !== BOOKING_STATUS.Approved) {
      return {
        code: RESPONSE_CODE.INVALID_INPUT,
        status: RESPONSE_STATUS.FAILED,
        message: `Booking cannot be completed. Current status: ${booking.status}. Booking must be Approved.`,
      };
    }

    // Complete the booking
    const completedBooking = await bookingService.completeBooking(bookingId);

    if (!completedBooking) {
      return {
        code: RESPONSE_CODE.INTERNAL_SERVER_ERROR,
        status: RESPONSE_STATUS.FAILED,
        message: 'Failed to complete booking',
      };
    }

    // Send completion notification via RabbitMQ
    try {
      await sendToQueue(
        MESSAGE_KEY.SABAY_ONE_USER_BOOKING_APPROVED,
        JSON.stringify({
          bookingId: completedBooking._id?.toString(),
          userId: completedBooking.user_id,
          totalAmount: completedBooking.total_amount,
          status: completedBooking.status,
          completedAt: completedBooking.completed_at || moment.now(),
        })
      );
      debug('Booking completion notification sent to queue');
    } catch (queueError) {
      debug('Failed to send completion notification:', queueError);
      // Don't fail the whole operation if queue fails
    }

    return {
      code: RESPONSE_CODE.SUCCESS,
      status: RESPONSE_STATUS.SUCCESS,
      message: 'Booking completed successfully',
      data: completedBooking,
    };
  } catch (error) {
    debug('Error completing booking:', error);
    return {
      code: RESPONSE_CODE.INTERNAL_SERVER_ERROR,
      status: RESPONSE_STATUS.FAILED,
      message: 'Error completing booking',
    };
  }
};

export default completeBookingAction;
