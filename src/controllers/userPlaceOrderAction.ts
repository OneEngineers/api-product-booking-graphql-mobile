import moment from 'moment';
import {
  CONTENT_TYPE,
  CURRENCY_CODE,
  ENV,
  PAYMENT_SERVICE_PROVIDER,
  PURCHASE_STATUS,
  RESPONSE_CODE,
  RESPONSE_STATUS,
} from '../constants';
import { PurchaseInput } from '../graphql/typeDefs';
import {
  DataPurchase,
  PaymentInfoInput,
  PaymentServiceProviderInput,
} from '../graphql/typeDefs/purchaseTypeDefs';
import { PurchaseItemService, PurchaseService } from '../services';
import { Types } from 'mongoose';
import {
  calculatePrice,
  debug,
  getContentFromCMS,
  getPaymentServiceProvider,
  getTotalAmountBaseOnPSP,
  getTransactionLogData,
} from '../utils';
import { Purchase, PurchaseItem } from '../entities';
import { TransactionLogService } from '../services/transactionLogService';

const userPurchaseAction = async (
  data: {
    hash: string;
    signature: string;
    timestamp: number;
    appAccountToken: string;
    input: PurchaseInput[];
    paymentServiceProvider: PaymentServiceProviderInput;
    paymentInfo: PaymentInfoInput;
  },
  user: { mysabayUserID?: number }
): Promise<DataPurchase> => {
  if (!data || !data.input || !data.input.length || data.input.length > 1) {
    debug('Invalid data input.');
    return {
      code: RESPONSE_CODE.INVALID_INPUT,
      status: RESPONSE_STATUS.FAILED,
    };
  }

  const paymentServiceProvider = getPaymentServiceProvider(
    data?.paymentServiceProvider
  );

  const currencyCode = data?.paymentInfo ? CURRENCY_CODE.USD : CURRENCY_CODE.SC;

  const purchaseItemService = new PurchaseItemService();
  const purchaseService = new PurchaseService();
  const transactionLogService = new TransactionLogService();

  // Predefine new user purchase
  const purchaseId = new Types.ObjectId();
  const newUserPurchase: Purchase = {
    _id: purchaseId,
    user_id: user.mysabayUserID,
    order_date: moment.now(),
    app_account_token: '',
    payment_service_provider: {
      code: paymentServiceProvider.code,
      name: paymentServiceProvider.name,
      paymentOption: data?.paymentServiceProvider?.paymentOption,
    },
    currency_code: currencyCode,
    total_amount: 0,
    ssn_txn_hash: `${purchaseId}`,
    status: PURCHASE_STATUS.Open,
    created_at: moment.now(),
  };

  const newPurchaseItems: PurchaseItem[] = [];
  let paymentAddress = `${ENV.API_USER_PSP_URL}/${purchaseId}*${ENV.PAYMENT_ADDRESS_DOMAIN}`;

  // Check apple payment
  if (data.appAccountToken) {
    // Add purchase data based on apple payment
    newUserPurchase.payment_service_provider.name =
      PAYMENT_SERVICE_PROVIDER.NAME.APPLE_PAYMENT;
    newUserPurchase.payment_service_provider.code =
      PAYMENT_SERVICE_PROVIDER.CODE.APPLE;
    newUserPurchase.currency_code = CURRENCY_CODE.USD;
    newUserPurchase.app_account_token = data.appAccountToken;
    paymentAddress = null;
  }

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

    // Validate price 0
    if (
      contentData?.Price === undefined ||
      (contentData?.Price <= 0 && contentData?.applePrice === undefined) ||
      contentData?.applePrice <= 0
    ) {
      debug(
        `Price: ${contentData.Price} and apple price: ${contentData.applePrice} must be greater then zero`
      );
      return {
        code: RESPONSE_CODE.INVALID_INPUT,
        status: RESPONSE_STATUS.FAILED,
      };
    }
    const userPurchaseItem = await purchaseItemService.getUserPurchaseItem(
      item.itemId,
      item.itemType,
      user.mysabayUserID
    );

    // Check if exist item with purchase status open will return payment address
    if (userPurchaseItem) {
      const existingPurchase = await purchaseService.getPurchaseById(
        String(userPurchaseItem.purchase_id)
      );

      if (
        existingPurchase &&
        existingPurchase.status === PURCHASE_STATUS.Open
      ) {
        debug(
          `The purchase item is already purchased with status open:`,
          existingPurchase._id.toHexString()
        );

        // Update existing purchase and purchase item record based on payment type
        let getPurchaseData = existingPurchase;
        if (
          existingPurchase.app_account_token !== data.appAccountToken || // token value have changes
          (!existingPurchase.app_account_token && !data.appAccountToken) // previously and now has no token
        ) {
          const priceCalculator = calculatePrice(
            data.appAccountToken,
            contentData,
            item,
            data?.paymentInfo,
            data?.paymentServiceProvider
          );

          // get total amount
          const totalAmount = getTotalAmountBaseOnPSP(
            data?.paymentInfo,
            priceCalculator.itemTotalAmount
          );

          const updatePurchaseItem: any = {
            price: priceCalculator.price,
            quantity: item.quantity,
            amount: priceCalculator.itemAmount,
            tax_rate: priceCalculator.taxRate,
            tax_amount: priceCalculator.taxAmount,
            discount_rate: priceCalculator.discountRate,
            discount_amount: priceCalculator.discountAmount,
          };

          await purchaseItemService.updateUserPurchaseItem(
            existingPurchase._id,
            updatePurchaseItem
          );

          await purchaseService.updateUserPurchase(existingPurchase._id, {
            currency_code: priceCalculator.currencyCode,
            payment_service_provider: {
              code: priceCalculator.psp.code,
              name: priceCalculator.psp.name,
              paymentOption: priceCalculator.psp.paymentOption,
            },
            app_account_token: data.appAccountToken || '',
            total_amount: totalAmount,
          });

          getPurchaseData = await purchaseService.getPurchaseById(
            String(userPurchaseItem.purchase_id)
          );
        }

        // Check apple payment
        if (!data.appAccountToken) {
          paymentAddress = `${ENV.API_USER_PSP_URL}/${existingPurchase._id.toHexString()}*${ENV.PAYMENT_ADDRESS_DOMAIN}`;
        }

        // create transaction log for direct payment by any bank pay_way
        if (data?.paymentInfo) {
          paymentAddress = null;
          const transactionLogData = getTransactionLogData(
            getPurchaseData,
            data?.paymentInfo,
            item.itemType,
            item.itemId
          );

          await transactionLogService.createTransactionLog(transactionLogData);
        }

        return {
          code: RESPONSE_CODE.SUCCESS,
          status: RESPONSE_STATUS.SUCCESS,
          data: {
            document: getPurchaseData,
            paymentAddress,
          },
        };
      }
    }

    // Validate existing purchase item
    if (userPurchaseItem && userPurchaseItem.expire_date === 0) {
      debug(`User already purchase item:`, userPurchaseItem);
      return {
        code: RESPONSE_CODE.INVALID_INPUT,
        status: RESPONSE_STATUS.FAILED,
      };
    }

    // Validate existing purchase items with an expiration date
    if (
      userPurchaseItem?.expire_date > 0 &&
      userPurchaseItem?.expire_date > moment.now()
    ) {
      debug(`User already purchase item:`, userPurchaseItem);
      return {
        code: RESPONSE_CODE.INVALID_INPUT,
        status: RESPONSE_STATUS.FAILED,
      };
    }

    const priceCalculator = calculatePrice(
      data.appAccountToken,
      contentData,
      item
    );

    // get total amount
    const totalAmount = getTotalAmountBaseOnPSP(
      data?.paymentInfo,
      priceCalculator.itemTotalAmount
    );

    // Create a new purchase item
    const newPurchaseItem: PurchaseItem = {
      user_id: user.mysabayUserID,
      purchase_id: purchaseId,
      item_type: item.itemType,
      item_id: item.itemId,
      price: priceCalculator.price,
      quantity: item.quantity,
      amount: priceCalculator.itemAmount,
      tax_rate: priceCalculator.taxRate,
      tax_amount: priceCalculator.taxAmount,
      discount_rate: priceCalculator.discountRate,
      discount_amount: priceCalculator.discountAmount,
      expire_date: priceCalculator.itemExpired,
      created_at: moment.now(),
    };
    newPurchaseItems.push(newPurchaseItem);

    // Update the total amount of the new user purchase
    newUserPurchase.total_amount += totalAmount;
  }
  // Save the new user purchase and purchase items
  const dataUserPurchase =
    await purchaseService.createPurchase(newUserPurchase);
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

export default userPurchaseAction;
