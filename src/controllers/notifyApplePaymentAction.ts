import moment from 'moment';
import {
  SignedDataVerifier,
  Environment,
  JWSTransactionDecodedPayload,
} from '@apple/app-store-server-library';
import jwt from 'jsonwebtoken';
import { PurchaseService } from '../services';
import { debug, getCaCertificate } from '../utils';
import {
  ENV,
  PURCHASE_STATUS,
  RESPONSE_CODE,
  RESPONSE_STATUS,
} from '../constants';

const notifyApplePaymentAction = async (
  signedPayload: string
): Promise<any> => {
  try {
    debug(
      '\n======================',
      moment().format('DD:MM:YYYY hh:mm:ss'),
      '======================'
    );

    // Get apple certificate
    const appleRootCAs = await getCaCertificate();

    // Verify sign data verify with apple
    let verify: SignedDataVerifier;
    if (ENV.APPLE_TEST) {
      const payloadData: any = jwt.decode(signedPayload);
      verify = new SignedDataVerifier(
        appleRootCAs,
        ENV.APPLE_ENABLE_ONLINE_CHECK,
        payloadData.data.environment,
        payloadData.data.bundleId,
        payloadData.data.appAppleId
      );
    } else {
      verify = new SignedDataVerifier(
        appleRootCAs,
        ENV.APPLE_ENABLE_ONLINE_CHECK,
        ENV.APPLE_ENVIRONMENT as Environment,
        ENV.APPLE_BUNDLE_ID,
        ENV.APPLE_APP_ID
      );
    }

    // Decode apple signed Payload
    const verifiedNotification =
      await verify.verifyAndDecodeNotification(signedPayload);

    // Decode token to get transaction detail
    const transactionInfo = jwt.decode(
      verifiedNotification.data.signedTransactionInfo
    ) as JWSTransactionDecodedPayload;
    debug('transaction Info: ', transactionInfo);
    const purchaseService = new PurchaseService();
    const getPurchase = await purchaseService.getPurchaseByAppAccountToken(
      transactionInfo.appAccountToken
    );

    // Check purchase not found
    if (!getPurchase) {
      debug(
        `Purchase not found with appAccountToken: `,
        transactionInfo.appAccountToken
      );
      return {
        code: RESPONSE_CODE.INVALID_INPUT,
        status: RESPONSE_STATUS.FAILED,
      };
    }

    // Check purchase status completed
    if (getPurchase.status === PURCHASE_STATUS.Completed) {
      debug(
        `Can not update while the purchase with appAccountToken ${transactionInfo.appAccountToken} already completed`
      );
      return {
        code: RESPONSE_CODE.INVALID_INPUT,
        status: RESPONSE_STATUS.FAILED,
      };
    }

    // Check apple environment

    // Update purchase status to completed
    await purchaseService.updatePurchaseStatus(
      getPurchase._id.toHexString(),
      PURCHASE_STATUS.Completed,
      transactionInfo.transactionId,
      transactionInfo.environment === Environment.SANDBOX
    );

    return {
      code: RESPONSE_CODE.SUCCESS,
      status: RESPONSE_STATUS.SUCCESS,
    };
  } catch (error) {
    debug('error: ', error);
    throw new Error(error);
  }
};

export default notifyApplePaymentAction;
