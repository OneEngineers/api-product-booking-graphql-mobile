import moment from 'moment';
import {
  BOOKING_STATUS,
  MESSAGE_KEY,
  RESPONSE_CODE,
  RESPONSE_STATUS,
} from '../constants';
import { BookingInput, DataBooking } from '../graphql/typeDefs/bookingTypeDefs';
import { BookingService } from '../services/bookingService';
import { debug, sendToQueue } from '../utils';
import { Booking } from '../entities';
import { Types } from 'mongoose';

const createUserBookingAction = async (
  data: {
    input: BookingInput[];
  },
  user: { mysabayUserID?: number }
): Promise<DataBooking> => {
  if (!data || !data.input || !data.input.length) {
    debug('Invalid data input.');
    return {
      code: RESPONSE_CODE.INVALID_INPUT,
      status: RESPONSE_STATUS.FAILED,
    };
  }

  const bookingService = new BookingService();

  const bookingId = new Types.ObjectId();
  const bookingDay = data.input[0].bookingDay || 1; // Default to 1 day if not provided
  const bookingDate = moment.now();
  const returnDate = bookingDate + bookingDay * 24 * 60 * 60 * 1000; // Calculate return date in milliseconds
  const newBooking: Booking = {
    _id: bookingId,
    user_id: user.mysabayUserID,
    booking_date: bookingDate,
    return_date: returnDate,
    booking_day: bookingDay,
    total_amount: 0,
    status: BOOKING_STATUS.Open,
    created_at: moment.now(),
  };

  const dataUserBooking = await bookingService.createBooking(newBooking);

  // publish to rabbitmq
  const message = { bookingId: dataUserBooking._id };
  await sendToQueue(
    MESSAGE_KEY.SABAY_ONE_USER_BOOKING_CREATE,
    JSON.stringify(message)
  );
  // rabbitMqUtil.publishMessage(
  //   channel,
  //   'sabay.one.user.booking.create',
  //   '',
  //   message
  // );

  return {
    code: RESPONSE_CODE.SUCCESS,
    status: RESPONSE_STATUS.SUCCESS,
    data: {
      document: dataUserBooking,
    },
  };
};

export default createUserBookingAction;
