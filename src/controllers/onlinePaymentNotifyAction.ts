import moment from 'moment';
import {
  MESSAGE_KEY,
  PAYMENT_STATUS,
  PAYMENT_STATUS_CODE,
  PURCHASE_STATUS,
  RESPONSE_CODE,
  RESPONSE_STATUS,
} from '../constants';
import {
  PaymentPushBackInfo,
  PaymentPushBackResponse,
} from '../graphql/typeDefs';
import { TransactionLogService } from '../services/transactionLogService';
import { debug, getPayWayTxnDetail, sendToQueue } from '../utils';
import { PurchaseService } from '../services';
import { TransactionLog } from '../entities/transactionLog';
import { Purchase } from '../entities';

const onlinePaymentNotifyAction = async (
  input: PaymentPushBackInfo
): Promise<PaymentPushBackResponse> => {
  const { transactionId, status: transactionStatus, apv } = input;
  // 1. Check existence of transaction log
  const transactionLogService = new TransactionLogService();
  const transactionLog = await transactionLogService.getTransactionLog({
    transaction_id: transactionId,
  });

  if (!transactionLog) {
    debug('Transaction log is not found for transactionId: ', transactionId);
    return {
      code: RESPONSE_CODE.NOT_FOUND_INPUT,
      status: RESPONSE_STATUS.FAILED,
      message: 'Transaction log not found.',
    };
  }

  if (transactionLog.payment_status === PAYMENT_STATUS.Completed) {
    debug(
      'Transaction log is already completed for transactionId: ',
      transactionId
    );
    return {
      code: RESPONSE_CODE.ALREADY_EXISTS,
      status: RESPONSE_STATUS.FAILED,
      message: 'Transaction log is already completed.',
    };
  }

  // 2. Check existence of transaction detail from ABA PayWay
  const checkTxnDetails = await getPayWayTxnDetail(
    transactionLog.transaction_id
  );

  if (!checkTxnDetails) {
    debug('Check transaction is not found from PayWay');
    return {
      code: RESPONSE_CODE.NOT_FOUND_INPUT,
      status: RESPONSE_STATUS.FAILED,
      message: 'Transaction not found.',
    };
  }

  // 3. Verify transaction status, amount and update purchase and transaction log
  let updatedPurchase: Purchase, updatedTransactionLog: TransactionLog;
  if (
    transactionStatus === PAYMENT_STATUS_CODE.Approved &&
    parseInt(checkTxnDetails.payment_status_code) === transactionStatus &&
    checkTxnDetails.total_amount === transactionLog.total_amount
  ) {
    // update purchase to completed
    const purchaseService = new PurchaseService();
    updatedPurchase = await purchaseService.updatePurchaseStatus(
      transactionLog.purchase_id.toString(),
      PURCHASE_STATUS.Completed
    );

    const updateTxnData = {
      payment_status: PAYMENT_STATUS.Completed,
      bank_apv: apv,
      payment_type: checkTxnDetails.payment_type,
      paid_date: moment.now(),
      updated_at: moment.now(),
      pp_response: {
        ...checkTxnDetails,
      },
    };

    // update transaction to completed
    updatedTransactionLog = await transactionLogService.updateTransactionLog(
      {
        _id: transactionLog._id,
        transaction_id: transactionLog.transaction_id,
      },
      updateTxnData
    );
    debug(
      'Payment is completed successfully for transactionId: ',
      transactionId
    );
  }

  // 4. Prepare queue message and send to queue for purchase log as external service
  const queueMessage = {
    mysabay_user_id: updatedPurchase.user_id,
    txn_hash: updatedTransactionLog.transaction_hash,
    transaction_id: updatedTransactionLog.transaction_id,
  };

  await sendToQueue(
    MESSAGE_KEY.MYSABAY_USER_PURCHASE_EXTERNAL_SERVICE,
    JSON.stringify(queueMessage)
  );

  return {
    code: RESPONSE_CODE.SUCCESS,
    status: RESPONSE_STATUS.SUCCESS,
    message: 'Verify payment is successful.',
  };
};

export default onlinePaymentNotifyAction;
