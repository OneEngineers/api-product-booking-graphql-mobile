import { BookingItemService, BookingService } from '../services';
import { RESPONSE_CODE, RESPONSE_STATUS } from '../constants';
import { BookingDetailInput, DataBookingDetail } from '../graphql/typeDefs';
import { debug, getContentAttribute } from '../utils';

const getUserBookingByIdAction = async (
  data: {
    hash: string;
    signature: string;
    timestamp: number;
    input: BookingDetailInput;
  },
  user: { mysabayUserID?: number }
): Promise<DataBookingDetail> => {
  const { input } = data;
  const bookingService = new BookingService();
  const bookingItemService = new BookingItemService();

  const userBooking = await bookingService.getUserBooking(
    user.mysabayUserID,
    input.BookingId
  );

  if (!userBooking) {
    debug(
      `User purchase not found. userId: ${user.mysabayUserID} purchaseId: ${input.BookingId}`
    );
    return {
      code: RESPONSE_CODE.NOT_FOUND_INPUT,
      status: RESPONSE_STATUS.FAILED,
    };
  }

  const arrUserBookingItem = await bookingItemService.getBookingItemByBookingId(
    userBooking.user_id,
    userBooking._id
  );

  if (!arrUserBookingItem.length) {
    debug(
      `User purchase item not found. userId: ${userBooking?.user_id} purchaseId: ${userBooking?._id}`
    );
    return {
      code: RESPONSE_CODE.NOT_FOUND_INPUT,
      status: RESPONSE_STATUS.FAILED,
    };
  }

  for (const bookingItem of arrUserBookingItem) {
    const contentAttribute = await getContentAttribute(
      bookingItem.item_type,
      bookingItem.item_id
    );
    bookingItem.contentAttribute = contentAttribute;
  }
  userBooking.items = arrUserBookingItem;

  return {
    code: RESPONSE_CODE.SUCCESS,
    status: RESPONSE_STATUS.SUCCESS,
    data: userBooking,
  };
};

export default getUserBookingByIdAction;
