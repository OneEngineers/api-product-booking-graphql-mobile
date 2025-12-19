import { debug } from 'console';
import { BookingService, BookingItemService } from '../services';
import { DataPurchaseItem, BookingItemInput } from '../graphql/typeDefs';
import {
  BOOKING_STATUS,
  CONTENT_TYPE,
  ENV,
  RESPONSE_CODE,
  RESPONSE_STATUS,
} from '../constants';
import { getContentFromCMS, getRedisCache, setRedisCache } from '../utils';
import moment from 'moment';

const validateBookingContentAction = async (
  queryOption: {
    hash: string;
    signature: string;
    timestamp: number;
    input: BookingItemInput;
  },
  user: { mysabayUserID?: number }
): Promise<DataPurchaseItem> => {
  const bookingItemService = new BookingItemService();
  const bookingService = new BookingService();

  let additionalFields = '';
  if (queryOption.input.contentType === CONTENT_TYPE.Movies) {
    additionalFields = `
    Price
    ExpiredDate
    episodes{
      data{
        attributes{
          Video
        }
      }
    }
  `;
  } else if (queryOption.input.contentType === CONTENT_TYPE.Book) {
    additionalFields = `Price`;
  }
  const getContentKey = `cms:content:${queryOption.input.contentType.toLowerCase()}:${queryOption.input.contentId}`;
  let getCMSContent = await getRedisCache(getContentKey);
  if (!getCMSContent) {
    getCMSContent = await getContentFromCMS(
      queryOption.input.contentType,
      queryOption.input.contentId,
      additionalFields
    );
    if (getCMSContent) {
      await setRedisCache(getContentKey, getCMSContent, ENV.CACHED_EXPIRE);
    }
  }

  debug(`CMS content: `, getCMSContent);

  if (getCMSContent?.ExpiredDate !== undefined) {
    // check expired date from cms
    if (getCMSContent.ExpiredDate !== 0) {
      const expiredDate = moment(getCMSContent.ExpiredDate).valueOf();
      if (expiredDate < moment.now()) {
        debug(`Content is expired: ${getCMSContent.id} `);
        return {
          code: RESPONSE_CODE.INVALID_INPUT,
          status: RESPONSE_STATUS.FAILED,
        };
      }
    }
  }

  // check price from cms
  if (getCMSContent?.Price <= 0) {
    return {
      code: RESPONSE_CODE.SUCCESS,
      status: RESPONSE_STATUS.SUCCESS,
    };
  }

  const getBookingItemKey = `${queryOption.input.contentType.toLowerCase()}:${queryOption.input.contentId}:${user.mysabayUserID}`;
  let getBookingItem = await getRedisCache(getBookingItemKey);

  if (!getBookingItem) {
    getBookingItem = await bookingItemService.getBookingItem(
      queryOption.input.contentType,
      queryOption.input.contentId,
      user.mysabayUserID
    );
    if (getBookingItem) {
      await setRedisCache(getBookingItemKey, getBookingItem, ENV.CACHED_EXPIRE);
    }
  }

  if (!getBookingItem) {
    debug(`Purchase Item not found`, queryOption.input);

    return {
      code: RESPONSE_CODE.NOT_FOUND_INPUT,
      status: RESPONSE_STATUS.FAILED,
    };
  }

  // check expire_date
  if (
    getBookingItem.expire_date > 0 &&
    getBookingItem.expire_date < moment.now()
  ) {
    debug(`Purchase item expired: ${getBookingItem._id}`);
    return {
      code: RESPONSE_CODE.INVALID_INPUT,
      status: RESPONSE_STATUS.FAILED,
    };
  }

  const bookingId = String(getBookingItem.booking_id);
  let getBooking = await getRedisCache(bookingId);

  if (!getBooking) {
    getBooking = await bookingService.getBookingeById(bookingId);
    if (getBooking) {
      await setRedisCache(bookingId, getBooking, ENV.CACHED_EXPIRE);
    }
  }

  if (!getBooking) {
    debug(`Purchase ${getBookingItem.booking_id} not found`);

    return {
      code: RESPONSE_CODE.NOT_FOUND_INPUT,
      status: RESPONSE_STATUS.FAILED,
    };
  }

  //check purchase status
  if (getBooking.status !== BOOKING_STATUS.Approved) {
    debug(`Purchase: ${getBooking._id} status open`);
    return {
      code: RESPONSE_CODE.INVALID_INPUT,
      status: RESPONSE_STATUS.FAILED,
    };
  }

  return {
    code: RESPONSE_CODE.SUCCESS,
    status: RESPONSE_STATUS.SUCCESS,
  };
};

export default validateBookingContentAction;
