import { Types } from 'mongoose';
import { RESPONSE_CODE, RESPONSE_STATUS } from '../constants';

import { TransactionLogRes } from '../graphql/typeDefs/transactionLogTypeDefs';
import { TransactionLogService } from '../services/transactionLogService';

const getTransactionLogAction = async (data: {
  transactionHash: string;
  transactionId?: string;
  purchaseId?: string;
}): Promise<TransactionLogRes> => {
  const { transactionHash, transactionId, purchaseId } = data;

  const query: any = {
    transaction_id: transactionId,
  };

  if (transactionHash) {
    query.transaction_hash = transactionHash;
  }

  if (purchaseId) {
    query.purchase_id = new Types.ObjectId(purchaseId);
  }

  const transactionLogService = new TransactionLogService();
  const transaction = await transactionLogService.getTransactionLog(query);

  if (!transaction) {
    return {
      code: RESPONSE_CODE.NOT_FOUND_INPUT,
      status: RESPONSE_STATUS.FAILED,
    };
  }

  return {
    code: RESPONSE_CODE.SUCCESS,
    status: RESPONSE_STATUS.SUCCESS,
    data: transaction,
  };
};

export default getTransactionLogAction;
