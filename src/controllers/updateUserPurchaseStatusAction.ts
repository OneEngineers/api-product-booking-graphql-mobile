import { PurchaseService } from '../services';
import { debug } from '../utils';
import { RESPONSE_CODE, RESPONSE_STATUS } from '../constants';
import {
  DataPurchaseDetail,
  UpdatePurchaseStatusInput,
} from '../graphql/typeDefs';

const UpdateUserPurchaseStatusAction = async (
  queryOption: {
    hash: string;
    signature: string;
    timestamp: number;
    input: UpdatePurchaseStatusInput;
  },
  user: { mysabayUserID?: number }
): Promise<DataPurchaseDetail> => {
  const { id, status } = queryOption.input;

  const purchaseService = new PurchaseService();
  const getPurchase = await purchaseService.getUserPurchase(
    user.mysabayUserID,
    id
  );

  if (!getPurchase) {
    debug(`Purchase ${id} not found`);
    return {
      code: RESPONSE_CODE.INVALID_INPUT,
      status: RESPONSE_STATUS.FAILED,
    };
  }

  // Update purchase status to completed
  const updateStatus = await purchaseService.updatePurchaseStatusByUser(
    id,
    user.mysabayUserID,
    status
  );

  return {
    code: RESPONSE_CODE.SUCCESS,
    status: RESPONSE_STATUS.SUCCESS,
    data: updateStatus,
  };
};

export default UpdateUserPurchaseStatusAction;
