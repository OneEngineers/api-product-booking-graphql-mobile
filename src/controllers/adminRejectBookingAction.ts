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

const adminRejectBookingAction = async (
  input: { bookingId: string; reason: string; adminId: string },
  adminUser: { mysabayUserID?: number; adminId?: string }
): Promise<AdminApprovalResponse> => {
  const { bookingId, reason, adminId } = input;

  // Validate admin permission
  if (!adminId || !adminUser.adminId) {
    return {
      code: RESPONSE_CODE.UNAUTHORIZED,
      status: RESPONSE_STATUS.FAILED,
      message: 'Admin authorization required',
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

    // Check if booking is in waiting status
    if (booking.status !== BOOKING_STATUS.Waiting) {
      return {
        code: RESPONSE_CODE.INVALID_INPUT,
        status: RESPONSE_STATUS.FAILED,
        message: `Booking cannot be rejected. Current status: ${booking.status}`,
      };
    }

    // Reject the booking
    const rejectedBooking = await bookingService.rejectBookingByAdmin(
      bookingId,
      adminId,
      reason
    );

    if (!rejectedBooking) {
      return {
        code: RESPONSE_CODE.INTERNAL_SERVER_ERROR,
        status: RESPONSE_STATUS.FAILED,
        message: 'Failed to reject booking',
      };
    }

    // Send rejection notification via RabbitMQ
    try {
      await sendToQueue(
        MESSAGE_KEY.SABAY_ONE_USER_BOOKING_APPROVED,
        JSON.stringify({
          bookingId: rejectedBooking._id?.toString(),
          userId: rejectedBooking.user_id,
          status: rejectedBooking.status,
          rejectedAt: rejectedBooking.rejected_at || moment.now(),
          rejectedBy: adminId,
          rejectionReason: reason,
        })
      );
      debug('Booking rejection notification sent to queue');
    } catch (queueError) {
      debug('Failed to send rejection notification:', queueError);
      // Don't fail the whole operation if queue fails
    }

    return {
      code: RESPONSE_CODE.SUCCESS,
      status: RESPONSE_STATUS.SUCCESS,
      message: 'Booking rejected successfully',
      data: rejectedBooking,
    };
  } catch (error) {
    debug('Error rejecting booking:', error);
    return {
      code: RESPONSE_CODE.INTERNAL_SERVER_ERROR,
      status: RESPONSE_STATUS.FAILED,
      message: 'Error rejecting booking',
    };
  }
};

export default adminRejectBookingAction;
