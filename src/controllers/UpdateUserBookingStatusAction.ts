import { BookingService } from '../services';
import { debug } from '../utils';
import { RESPONSE_CODE, RESPONSE_STATUS } from '../constants';
import {
  DataBookingDetail,
  UpdateBookingStatusInput,
} from '../graphql/typeDefs';

const UpdateUserBookingStatusAction = async (
  queryOption: {
    hash: string;
    signature: string;
    timestamp: number;
    input: UpdateBookingStatusInput;
  },
  user: { mysabayUserID?: number }
): Promise<DataBookingDetail> => {
  const { id, status } = queryOption.input;

  const bookingService = new BookingService();
  const getBooking = await bookingService.getUserBooking(
    user.mysabayUserID,
    id
  );

  if (!getBooking) {
    debug(`Purchase ${id} not found`);
    return {
      code: RESPONSE_CODE.INVALID_INPUT,
      status: RESPONSE_STATUS.FAILED,
    };
  }

  // Update purchase status to completed
  const updateStatus = await bookingService.updateBookingStatusByUser(
    id,
    user.mysabayUserID,
    status
  );

  return {
    code: RESPONSE_CODE.SUCCESS,
    status: RESPONSE_STATUS.SUCCESS,
    data: updateStatus,
  };
};

export default UpdateUserBookingStatusAction;
