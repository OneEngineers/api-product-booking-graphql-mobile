import moment from 'moment';
import {
  BOOKING_STATUS,
  CONTENT_TYPE,
  CURRENCY_CODE,
  ENV,
  PAYMENT_SERVICE_PROVIDER,
  PAYMENT_STATUS,
  USD_EXCHANGE_RATE,
} from '../constants';
import {
  AnyObject,
  PaymentInfo,
  PaymentServiceProvider,
  BookingInfo,
} from '../types';
import {
  getBookFromCMS,
  getMovieFromCMS,
  getPodcastFromCMS,
} from './apiServiceUtil';
import { getRedisCache, setRedisCache } from './redisUtil';
import { Booking, Purchase, TransactionBooking } from '../entities';
import { TransactionLog } from '../entities/transactionLog';

export const JSONStringParser = (value: any): any => {
  try {
    return JSON.parse(value);
  } catch (error) {
    return value;
  }
};

export const convertSnakeCaseToPascalCase = (word: string): string => {
  return `${word}`
    .toLowerCase()
    .replace(new RegExp(/[-_]+/, 'g'), ' ')
    .replace(new RegExp(/[^\w\s]/, 'g'), '')
    .replace(
      new RegExp(/\s+(.)(\w*)/, 'g'),
      ($1, $2, $3) => `${$2.toUpperCase() + $3}`
    );
};

// todo: should update to support multiples level object
export const convertObjectKeysFromSnakeToPascalCase = (obj: {
  [index: string]: unknown;
}): { [index: string]: unknown } => {
  if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
    const newObj: { [index: string]: unknown } = {};

    Object.keys(obj).forEach((key: string) => {
      const newKey = convertSnakeCaseToPascalCase(key);
      newObj[newKey] = obj[key];
    });

    return newObj;
  }
  return obj;
};

export const debug = ENV.DEBUG_MODE ? console.log : () => {};

export const isJsonObjectWithinSizeLimit = (
  obj: AnyObject,
  maxSizeInMB: number
): boolean => {
  const stringifiedObject = JSON.stringify(obj);
  const sizeInBytes = new TextEncoder().encode(stringifiedObject).length;
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

  return sizeInBytes <= maxSizeInBytes;
};

export const getContentAttribute = async (
  contentType: string,
  contentId: string
): Promise<any> => {
  const getContentKey = `${contentType.toLowerCase()}:${contentId}`;
  const contentData = await getRedisCache(getContentKey);
  if (contentData) return contentData;

  let response: any;
  let err: any;
  if (contentType === CONTENT_TYPE.Movies) {
    [response, err] = await getMovieFromCMS(contentId);
  } else if (contentType === CONTENT_TYPE.Book) {
    [response, err] = await getBookFromCMS(contentId);
  } else if (contentType === CONTENT_TYPE.Podcast) {
    [response, err] = await getPodcastFromCMS(contentId);
  }

  switch (contentType) {
    case CONTENT_TYPE.Book:
      if (!response || err) {
        debug(`Get ${contentType} from cms error strapi v5:`, err ?? '');
        return null;
      }
      break;
    default:
      if (!response.data || err) {
        debug(`Get ${contentType} from cms error strapi v4:`, err ?? '');
        return null;
      }
      break;
  }

  const setContentKey = `${contentType.toLowerCase()}:${contentId}`;
  if (contentType === CONTENT_TYPE.Book) {
    await setRedisCache(setContentKey, response, ENV.CACHED_EXPIRE);
    return response;
  }
  await setRedisCache(
    setContentKey,
    response?.data?.attributes,
    ENV.CACHED_EXPIRE
  );

  return response?.data?.attributes;
};

export const getContentFromCMS = async (
  contentType: string,
  contentId: string,
  additionalFields?: string
): Promise<any> => {
  let response: any;
  let err: any;
  if (contentType === CONTENT_TYPE.Movies) {
    [response, err] = await getMovieFromCMS(contentId, additionalFields);
  } else if (contentType === CONTENT_TYPE.Book) {
    [response, err] = await getBookFromCMS(contentId, additionalFields);
  } else if (contentType === CONTENT_TYPE.Podcast) {
    [response, err] = await getPodcastFromCMS(contentId);
  }

  if (err) {
    debug(`Get ${contentType} error`, err ?? '');
    return null;
  }
  if (contentType === CONTENT_TYPE.Book) {
    return response;
  }
  return response?.data?.attributes;
};

export const generateHashWithTimestamp = async (dataToHash?: string) => {
  const timestamp = Date.now().toString(10); // Get current timestamp

  // Generate a unique ID (using a library-free approach)
  const uniqueId = Math.random().toString(36).substring(2, 7);

  // Construct the string to hash
  const hashInput = dataToHash
    ? `${dataToHash}-${uniqueId}-${timestamp}`
    : `${uniqueId}-${timestamp}`;

  // Implement a secure hashing algorithm (e.g., SHA-256)
  const hash = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(hashInput)
  );
  const hashArray = Array.from(new Uint8Array(hash));
  const hashHex = hashArray
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');

  // Return the combined hash and timestamp
  return `${hashHex}${timestamp}`;
};

export const convertKHRToSC = (KHRAmount: number) => {
  const scAmount = KHRAmount / 100;
  return scAmount;
};

export const convertKHRToUSD = (KHRAmount: number) => {
  const usdAmount = KHRAmount / USD_EXCHANGE_RATE;
  return usdAmount;
};

export const calculatePrice = (
  appAccountToken: string,
  contentData: any,
  item: any,
  paymentInfo?: PaymentInfo,
  paymentProvider?: PaymentServiceProvider
) => {
  let itemTotalAmount = 0;
  let price = 0;
  let taxAmount = 0;
  let discountAmount = 0;
  let taxRate = 0;
  let itemAmount = 0;
  let discountRate = 0;
  let currencyCode = CURRENCY_CODE.SC;
  let psp = {
    code: PAYMENT_SERVICE_PROVIDER.CODE.SABAY,
    name: PAYMENT_SERVICE_PROVIDER.NAME.SABAY_COIN,
    paymentOption: null,
  };

  if (appAccountToken) {
    // Apple price
    itemTotalAmount = contentData.applePrice;
    price = contentData.applePrice;
    itemAmount = contentData.applePrice;
    currencyCode = CURRENCY_CODE.USD;
    psp = {
      code: PAYMENT_SERVICE_PROVIDER.CODE.APPLE,
      name: PAYMENT_SERVICE_PROVIDER.NAME.APPLE_PAYMENT,
      paymentOption: null,
    };
  } else if (paymentInfo) {
    price = Math.round(convertKHRToUSD(contentData.Price));
    itemAmount = price * item.quantity;
    taxAmount = Math.round(convertKHRToUSD(itemAmount * contentData.VAT));
    taxRate = contentData.VAT;
    discountRate = contentData.Discount;
    currencyCode = CURRENCY_CODE.USD;
    psp = {
      code: paymentProvider.code,
      name: paymentProvider.name,
      paymentOption: paymentProvider.paymentOption,
    };

    // Calculate price and tax with discount
    if (contentData?.Discount > 0) {
      discountAmount = Math.round(
        convertKHRToUSD(itemAmount * contentData.Discount)
      );
      const amountAfterDiscount = itemAmount - discountAmount;
      itemTotalAmount = amountAfterDiscount + taxAmount;
    } else {
      // Calculate price and tax without discount
      itemTotalAmount = itemAmount + taxAmount;
    }
  } else {
    // Calculate price khr
    price = Math.round(convertKHRToSC(contentData.Price));
    itemAmount = price * item.quantity;
    taxAmount = Math.round((itemAmount * contentData.VAT) / 100);
    taxRate = contentData.VAT;
    discountRate = contentData.Discount;

    // Calculate price and tax with discount
    if (contentData?.Discount > 0) {
      discountAmount = Math.round((itemAmount * contentData.Discount) / 100);
      const amountAfterDiscount = itemAmount - discountAmount;
      itemTotalAmount = amountAfterDiscount + taxAmount;
    } else {
      // Calculate price and tax without discount
      itemTotalAmount = itemAmount + taxAmount;
    }
  }

  let itemExpired = 0;
  if (contentData.ExpiredDate && contentData.ExpiredDate !== undefined) {
    itemExpired = moment(contentData.ExpiredDate).valueOf();
  }

  return {
    taxAmount: taxAmount,
    taxRate,
    discountAmount,
    discountRate,
    price,
    itemAmount,
    itemTotalAmount,
    itemExpired,
    currencyCode,
    psp,
  };
};

export const getPaymentServiceProvider = (
  paymentServiceProvider: PaymentServiceProvider
) => {
  return {
    code: paymentServiceProvider?.code ?? PAYMENT_SERVICE_PROVIDER.CODE.SABAY,
    name:
      paymentServiceProvider?.name ?? PAYMENT_SERVICE_PROVIDER.NAME.SABAY_COIN,
    paymentOption: paymentServiceProvider?.paymentOption ?? null,
  };
};

export const getTransactionLogData = (
  purchaseData: Purchase,
  paymentInfo: PaymentInfo,
  itemType?: string,
  itemId?: string
) => {
  const transactionLog: TransactionLog = {
    transaction_id: paymentInfo.transactionId,
    transaction_hash: paymentInfo.transactionHash,
    purchase_id: purchaseData._id,
    total_amount: purchaseData.total_amount,
    payment_status: PAYMENT_STATUS.Pending,
    payment_service_provider: purchaseData.payment_service_provider.code,
    detail: { item_type: itemType, item_id: itemId },
    created_at: moment.now(),
  };

  return transactionLog;
};

export const getTransactionBookingLogData = (
  bookingInfo: BookingInfo,
  bookData: Booking,
  itemType?: string,
  itemId?: string
) => {
  const transactionLog: TransactionBooking = {
    transaction_id: bookingInfo.transactionId,
    transaction_hash: bookingInfo.transactionHash,
    book_id: bookData._id,
    total_amount: bookData.total_amount,
    booking_status: BOOKING_STATUS.Waiting,
    detail: { item_type: itemType, item_id: itemId },
    created_at: moment.now(),
  };

  return transactionLog;
};

export const getTotalAmountBaseOnPSP = (
  paymentInfo: PaymentInfo,
  itemTotalAmount: number
) => {
  // paymentinfo amount is the totalAmount for direct purchase with pay_way
  // itemTotalAmount is the amount that calculated for purchase with SC or Apple pay
  return paymentInfo ? paymentInfo.amount : itemTotalAmount;
};

export const totalBookingAmount = (contentData: any, item: any) => {
  const itemTotalAmount = 0;
  return itemTotalAmount;
};
export const getTotalAmountCMS = (itemTotalAmount: number) => {
  // paymentinfo amount is the totalAmount for direct purchase with pay_way
  // itemTotalAmount is the amount that calculated for purchase with SC or Apple pay
  return itemTotalAmount;
};
