import moment from 'moment';
import {
  BOOKING_STATUS,
  MESSAGE_KEY,
  RESPONSE_CODE,
  RESPONSE_STATUS,
} from '../constants';
import { BookingInput, DataBooking } from '../graphql/typeDefs/bookingTypeDefs';
import { BookingService } from '../services/bookingService';
import {
  debug,
  sendToQueue,
  getTransactionLogBookingData,
  generateHashWithTimestamp,
} from '../utils';
import { Booking, BookingItem } from '../entities';
import { Types } from 'mongoose';
import { BookingItemService, TransactionBookingService } from '../services';

const buildBookingInfo = async (bookingData: Booking) => ({
  transactionId: `BOOK-${bookingData._id?.toString()}-${Date.now()}`,
  transactionHash: await generateHashWithTimestamp(bookingData._id?.toString()),
  amount: bookingData.total_amount,
  service_reffer: `booking-${bookingData._id?.toString()}`,
});

const createUserBookingAction = async (
  data: {
    total?: number;
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
  const bookingItemService = new BookingItemService();
  const transactionLogService = new TransactionBookingService();

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
  const newBookingItems: BookingItem[] = [];
  for (const item of data.input) {
    const userBookingItem = await bookingItemService.getUserBookingItem(
      item.itemId,
      item.itemType,
      user.mysabayUserID
    );
    // Check if exist item with purchase status open will return payment address
    if (userBookingItem) {
      const existingBooking = await bookingService.getBookingById(
        String(userBookingItem.booking_id)
      );

      if (existingBooking && existingBooking.status === BOOKING_STATUS.Open) {
        debug(
          `The purchase item is already purchased with status open:`,
          existingBooking._id.toHexString()
        );

        // Update existing purchase and purchase item record based on payment type
        let getBookingData = existingBooking;
        if (existingBooking.status == BOOKING_STATUS.Open) {
          const updateBooingItem: any = {
            quantity: item.quantity,
          };

          await bookingItemService.updateUserBookingItem(
            existingBooking._id,
            updateBooingItem
          );

          await bookingService.updateUserBooking(existingBooking._id, {
            total_amount: data.total++,
          });

          getBookingData = await bookingService.getBookingById(
            String(updateBooingItem.purchase_id)
          );
        }

        // create transaction log for direct payment by any bank pay_way
        const bookingInfo = await buildBookingInfo(getBookingData);

        const transactionLogData = getTransactionLogBookingData(
          getBookingData,
          bookingInfo,
          item.itemType,
          item.itemId
        );

        await transactionLogService.createTransactionLog(transactionLogData);

        return {
          code: RESPONSE_CODE.SUCCESS,
          status: RESPONSE_STATUS.SUCCESS,
          data: {
            document: getBookingData,
          },
        };
      }
    }
    if (userBookingItem && userBookingItem.expire_date === 0) {
      debug(`User already purchase item:`, userBookingItem);
      return {
        code: RESPONSE_CODE.INVALID_INPUT,
        status: RESPONSE_STATUS.FAILED,
      };
    }
    if (
      userBookingItem?.expire_date > 0 &&
      userBookingItem?.expire_date > moment.now()
    ) {
      debug(`User already purchase item:`, userBookingItem);
      return {
        code: RESPONSE_CODE.INVALID_INPUT,
        status: RESPONSE_STATUS.FAILED,
      };
    }
    const newBookingItem: BookingItem = {
      user_id: user.mysabayUserID,
      booking_id: bookingId,
      item_type: item.itemType,
      item_id: item.itemId,
      quantity: item.quantity,
      amount: null,
      expire_date: null,
      created_at: moment.now(),
    };
    newBookingItems.push(newBookingItem);
    // newUserBooking.total_amount += totalAmount;
    // Save the new user purchase and purchase items
    const dataUserBooking = await bookingService.createBooking(newBooking);
    await bookingItemService.createManyUserBookingItems(newBookingItems);

    const bookingInfo = await buildBookingInfo(dataUserBooking);

    const transactionLogData = getTransactionLogBookingData(
      dataUserBooking,
      bookingInfo,
      newBookingItems[0]?.item_type,
      newBookingItems[0]?.item_id
    );
    await transactionLogService.createTransactionLog(transactionLogData);
    // Send booking created notification to admin for approval
    try {
      await sendToQueue(
        MESSAGE_KEY.SABAY_ONE_USER_BOOKING_CREATE,
        JSON.stringify({
          bookingId: dataUserBooking._id?.toString(),
          userId: dataUserBooking.user_id,
          totalAmount: dataUserBooking.total_amount,
          status: dataUserBooking.status,
          createdAt: dataUserBooking.created_at,
          items: newBookingItems,
        })
      );
      debug('Booking creation notification sent to admin queue');
    } catch (queueError) {
      debug('Failed to send booking creation notification:', queueError);
      // Don't fail the whole operation if queue fails
    }
    return {
      code: RESPONSE_CODE.SUCCESS,
      status: RESPONSE_STATUS.SUCCESS,
      data: {
        document: dataUserBooking,
      },
    };
  }
};

export default createUserBookingAction;
