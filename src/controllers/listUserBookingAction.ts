import {
  ListUserBookingInput,
  UserBookingDataResponse,
} from '../graphql/typeDefs';
import { BookingService } from '../services';

const listUserBookingAction = async (
  data: {
    hash: string;
    signature: string;
    timestamp: number;
    input: ListUserBookingInput;
  },
  user: { mysabayUserID?: number }
): Promise<UserBookingDataResponse> => {
  const { input } = data;

  const bookingService = new BookingService();
  return await bookingService.listUserBooking(
    user.mysabayUserID,
    input?.filter,
    input?.pager
  );
};

export default listUserBookingAction;
