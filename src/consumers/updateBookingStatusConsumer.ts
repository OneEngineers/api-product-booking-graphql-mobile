import amqp from 'amqplib';
import { PurchaseService } from '../services';
import { debug, httpGet } from '../utils';
import {
  MESSAGE_KEY,
  EXCHANGE_QUEUE_MESSAGE_KEY,
  QUEUE_TYPE,
  ENV,
  PURCHASE_STATUS,
} from '../constants';

/*
      Description: Update purchase status To completed
      @param object data: {
        string txn_hash
      }
  */

const updateBookingStatusConsumer = async (channel: amqp.Channel) => {
  try {
    channel.assertExchange(MESSAGE_KEY.USER_BOOKING_UPDATE, QUEUE_TYPE.FANOUT, {
      durable: true,
    });

    const assertQueue = await channel.assertQueue(
      EXCHANGE_QUEUE_MESSAGE_KEY.USER_BOOKING_UPDATE_QUEUE,
      { exclusive: false }
    );

    if (assertQueue.queue) {
      channel.prefetch(1);
      channel.bindQueue(assertQueue.queue, MESSAGE_KEY.USER_BOOKING_UPDATE, '');

      channel.consume(
        assertQueue.queue,
        async (msg: any) => {
          const data = JSON.parse(msg.content.toString());
          const { txn_hash: ssnTxHash } = data;
          if (ssnTxHash) {
            const purchaseService = new PurchaseService();

            const checkPurchase =
              await purchaseService.getPurchaseByHash(ssnTxHash);
            if (checkPurchase) {
              debug(`Hash already exist: ${ssnTxHash}`);
              return; // Hash already exist
            }

            const [transactions, transactionError] = await httpGet(
              `${ENV.API_SSN_URL}/transactions/${ssnTxHash}`
            );
            if (transactionError) {
              debug(`Transaction hash invalid: ${ssnTxHash}`);
              return; // Transaction hash invalid
            }

            const memo = transactions.data.memo;
            const purchaseId = memo.split('@')[0];

            // get purchase

            const getPurchase =
              await purchaseService.getPurchaseById(purchaseId);

            if (!getPurchase) {
              debug(`Purchase ${purchaseId} not found`);
              return; // Purchase not found
            }
            if (getPurchase.status === PURCHASE_STATUS.Completed) {
              debug(
                `Can not update while the purchase ${purchaseId} already completed`
              );
              return; // Can not update while the purchase already completed
            }

            // update purchase status to completed
            await purchaseService.updatePurchaseStatus(
              purchaseId,
              PURCHASE_STATUS.Completed,
              ssnTxHash
            );
          }
        },
        { noAck: true }
      );
    }
  } catch (error) {
    console.log('queue consumer error: ', error);
  }
};

export default updateBookingStatusConsumer;
