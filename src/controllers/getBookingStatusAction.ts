import { BookingService } from '../services/bookingService';
import { RESPONSE_CODE, RESPONSE_STATUS } from '../constants';
import { debug } from '../utils';
import { DataBookingDetail } from '../graphql/typeDefs/bookingTypeDefs';

const getBookingStatusAction = async (
  data: {
    _id: string;
    hash: string;
    signature: string;
    timestamp: number;
    input: { bookingId: string };
  },
  user: { mysabayUserID?: number }
): Promise<
  DataBookingDetail | { code: string; status: string; message: string }
> => {
  const { input } = data;
  const { bookingId } = input;

  if (!bookingId) {
    debug('Booking ID is required');
    return {
      code: RESPONSE_CODE.INVALID_INPUT,
      status: RESPONSE_STATUS.FAILED,
      message: 'Booking ID is required',
    } as any;
  }

  try {
    const bookingService = new BookingService();

    // Get booking
    const booking = await bookingService.getBookingById(bookingId);

    if (!booking) {
      debug(`Booking not found: ${bookingId}`);
      return {
        code: RESPONSE_CODE.NOT_FOUND_INPUT,
        status: RESPONSE_STATUS.FAILED,
        message: 'Booking not found',
      };
    }

    // Verify user ownership
    if (booking.user_id !== user.mysabayUserID) {
      debug(
        `Unauthorized access to booking ${bookingId} by user ${user.mysabayUserID}`
      );
      return {
        code: RESPONSE_CODE.UNAUTHORIZED,
        status: RESPONSE_STATUS.FAILED,
        message: 'Unauthorized access',
      };
    }

    return {
      code: RESPONSE_CODE.SUCCESS,
      status: RESPONSE_STATUS.SUCCESS,
    };
  } catch (error) {
    debug(`Error fetching booking status: ${error}`);
    return {
      code: RESPONSE_CODE.INTERNAL_SERVER_ERROR,
      status: RESPONSE_STATUS.FAILED,
      message: 'Internal server error',
    };
  }
};

export default getBookingStatusAction;
