import moment from 'moment';
import {
  BOOKING_STATUS,
  CONTENT_TYPE,
  RESPONSE_CODE,
  RESPONSE_STATUS,
} from '../constants';
import { BookingInput, DataBooking } from '../graphql/typeDefs';

import { BookingItemService, BookingService, TransactionBookingService } from '../services';
import { Types } from 'mongoose';
import {
  debug,
  getContentFromCMS,
  getTotalAmountCMS,
  getTransactionBookingLogData,
  getTransactionLogData,
  totalBookingAmount,
} from '../utils';
import { Booking, BookingItem } from '../entities';
import { TransactionLogService } from '../services/transactionLogService';
import { BookingInfo } from '../types';

const userBookingeAction = async (
  data: {
    hash: string;
    timestamp: number;
    input: BookingInput[];
    status_app: BOOKING_STATUS.Approved;
    bookinInfo: BookingInfo;
  },
  user: { mysabayUserID?: number }
): Promise<DataBooking> => {
  if (!data || !data.input || !data.input.length || data.input.length > 1) {
    debug('Invalid data input.');
    return {
      code: RESPONSE_CODE.INVALID_INPUT,
      status: RESPONSE_STATUS.FAILED,
    };
  }

  const bookingItemService = new BookingItemService();
  const bookingService = new BookingService();
  const transactionLogService = new TransactionBookingService();

  // Predefine new user purchase
  const bookingId = new Types.ObjectId();
  const newUserBooking: Booking = {
    _id: bookingId,
    user_id: user.mysabayUserID,
    total_amount: 0,
    status: BOOKING_STATUS.Approved,
    created_at: moment.now(),
  };

  const newBookingItems: BookingItem[] = [];
  // let paymentAddress = `${ENV.API_USER_PSP_URL}/${purchaseId}*${ENV.PAYMENT_ADDRESS_DOMAIN}`;

  for (const item of data.input) {
    let additionalFields = '';
    if (item.itemType === CONTENT_TYPE.Movies) {
      additionalFields = `
        Price
        applePrice
        VAT
        Discount
        ExpiredDate`;
    } else if (item.itemType === CONTENT_TYPE.Book) {
      additionalFields = `
        Price
        applePrice
        VAT
        Discount`;
    }

    const contentData = await getContentFromCMS(
      item.itemType,
      item.itemId,
      additionalFields
    );
    if (!contentData) {
      debug(
        `Get content(id: ${item.itemId}, type: ${item.itemType}) from cms is not found.`
      );
      return {
        code: RESPONSE_CODE.NOT_FOUND_INPUT,
        status: RESPONSE_STATUS.FAILED,
      };
    }

    // Check expired date from cms
    if (contentData?.ExpiredDate !== undefined) {
      if (contentData.ExpiredDate !== 0) {
        const expiredDate = moment(contentData.ExpiredDate).valueOf();
        if (expiredDate < moment.now()) {
          debug(
            `Content (id: ${item.itemId}, type: ${item.itemType}) is expired.`
          );
          return {
            code: RESPONSE_CODE.INVALID_INPUT,
            status: RESPONSE_STATUS.FAILED,
          };
        }
      }
    }

    const userBookingItem = await bookingItemService.getUserBookingItem(
      item.itemId,
      item.itemType,
      user.mysabayUserID
    );

    // Check if exist item with purchase status open will return payment address
    if (userBookingItem) {
      const existingBooking = await bookingService.getBookingeById(
        String(userBookingItem.booking_id)
      );

      if (
        existingBooking &&
        existingBooking.status === BOOKING_STATUS.Waiting
      ) {
        debug(
          `The purchase item is already purchased with status open:`,
          existingBooking._id.toHexString()
        );

        // Update existing purchase and purchase item record based on payment type
        let getBookingData = existingBooking;

        if (!existingBooking.status) {
          const bookingAmountCMS = totalBookingAmount(contentData, item);
          // get total amount
          const totalAmount = getTotalAmountCMS(bookingAmountCMS);

          const updateBookingItem: any = {
            quantity: item.quantity,
          };

          await bookingItemService.updateUserBookingItem(
            existingBooking._id,
            updateBookingItem
          );

          await bookingService.updateUserBooking(existingBooking._id, {
            total_amount: totalAmount,
          });

          getBookingData = await bookingService.getBookingeById(
            String(userBookingItem.booking_id)
          );
        }

        // create transaction log for direct payment by any bank pay_way
        if (data?.status_app) {
          const transactionLogData = getTransactionBookingLogData(
            data?.bookinInfo,
            getBookingData,
            item.itemType,
            item.itemId
          );

          await transactionLogService.createTransactionLog(transactionLogData);
        }

        return {
          code: RESPONSE_CODE.SUCCESS,
          status: RESPONSE_STATUS.SUCCESS,
          data: {
            document: getBookingData,
            paymentAddress: null,
          },
        };
      }
    }

    // Validate existing purchase item
    if (userBookingItem && userBookingItem.expire_date === 0) {
      debug(`User already purchase item:`, userBookingItem);
      return {
        code: RESPONSE_CODE.INVALID_INPUT,
        status: RESPONSE_STATUS.FAILED,
      };
    }

    // Validate existing purchase items with an expiration date
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

    const bookingItem = totalBookingAmount(contentData, item);

    // get total amount
    const totalAmount = getContentFromCMS(bookingItem);

    // Create a new purchase item
    const newBookingItem: BookingItem = {
      user_id: user.mysabayUserID,
      booking_id: bookingId,
      item_type: item.itemType,
      item_id: item.itemId,
      quantity: item.quantity,
      amount: bookingItem.itemAmount,
      expire_date: priceCalculator.itemExpired,
      created_at: moment.now(),
    };
    newBookingItems.push(newBookingItem);

    // Update the total amount of the new user purchase
    newBookingItem.total_amount += totalAmount;
  }
  // Save the new user purchase and purchase items
  const dataUserPurchase =
    await purchaseService.createPurchase(newUserBooking);
  await purchaseItemService.createManyUserPurchaseItems(newPurchaseItems);

  // create transaction log for direct payment by any bank pay_way
  if (data?.paymentInfo) {
    paymentAddress = null;
    const transactionLogData = getTransactionLogData(
      dataUserPurchase,
      data?.paymentInfo,
      newPurchaseItems[0]?.item_type,
      newPurchaseItems[0]?.item_id
    );
    await transactionLogService.createTransactionLog(transactionLogData);
  }

  // Return the data user purchase
  return {
    code: RESPONSE_CODE.SUCCESS,
    status: RESPONSE_STATUS.SUCCESS,
    data: {
      document: dataUserPurchase,
      paymentAddress,
    },
  };
};

export default userBookingeAction;
