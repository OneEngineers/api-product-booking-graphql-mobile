import moment from 'moment';
import {
  RESPONSE_CODE,
  RESPONSE_STATUS,
  BOOKING_STATUS,
  MESSAGE_KEY,
} from '../constants';
import { BookingService } from '../services/bookingService';
import { debug, sendToQueue } from '../utils';
import {
  AdminApproveBookingInput,
  AdminApprovalResponse,
} from '../graphql/typeDefs/bookingTypeDefs';

const adminApproveBookingAction = async (
  input: AdminApproveBookingInput
): Promise<AdminApprovalResponse> => {
  const { bookingId, approvalNotes } = input;

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

    // Check if booking is in waiting status
    if (booking.status !== BOOKING_STATUS.Open) {
      return {
        code: RESPONSE_CODE.INVALID_INPUT,
        status: RESPONSE_STATUS.FAILED,
        message: `Booking cannot be approved. Current status: ${booking.status}`,
      };
    }

    // Approve the booking
    const approvedBooking = await bookingService.approveBookingByAdmin(
      bookingId,
      approvalNotes
    );

    if (!approvedBooking) {
      return {
        code: RESPONSE_CODE.INTERNAL_SERVER_ERROR,
        status: RESPONSE_STATUS.FAILED,
        message: 'Failed to approve booking',
      };
    }

    // Send approval notification via RabbitMQ
    try {
      await sendToQueue(
        MESSAGE_KEY.SABAY_ONE_USER_BOOKING_APPROVED,
        JSON.stringify({
          bookingId: approvedBooking._id?.toString(),
          userId: approvedBooking.user_id,
          totalAmount: approvedBooking.total_amount,
          status: approvedBooking.status,
          approvedAt: approvedBooking.approved_at || moment.now(),
          approvalNotes: approvalNotes,
        })
      );
      debug('Booking approval notification sent to queue');
    } catch (queueError) {
      debug('Failed to send approval notification:', queueError);
      // Don't fail the whole operation if queue fails
    }

    return {
      code: RESPONSE_CODE.SUCCESS,
      status: RESPONSE_STATUS.SUCCESS,
      message: 'Booking approved successfully',
      data: approvedBooking,
    };
  } catch (error) {
    debug('Error approving booking:', error);
    return {
      code: RESPONSE_CODE.INTERNAL_SERVER_ERROR,
      status: RESPONSE_STATUS.FAILED,
      message: 'Error approving booking',
    };
  }
};

export default adminApproveBookingAction;
