import { PurchaseItemService, PurchaseService } from '../services';
import { RESPONSE_CODE, RESPONSE_STATUS } from '../constants';
import { DataPurchaseDetail, PurchaseDetailInput } from '../graphql/typeDefs';
import { debug, getContentAttribute } from '../utils';

const getUserOrderByIdAction = async (
  data: {
    hash: string;
    signature: string;
    timestamp: number;
    input: PurchaseDetailInput;
  },
  user: { mysabayUserID?: number }
): Promise<DataPurchaseDetail> => {
  const { input } = data;
  const purchaseService = new PurchaseService();
  const purchaseItemService = new PurchaseItemService();

  const userPurchase = await purchaseService.getUserPurchase(
    user.mysabayUserID,
    input.PurchaseId
  );

  if (!userPurchase) {
    debug(
      `User purchase not found. userId: ${user.mysabayUserID} purchaseId: ${input.PurchaseId}`
    );
    return {
      code: RESPONSE_CODE.NOT_FOUND_INPUT,
      status: RESPONSE_STATUS.FAILED,
    };
  }

  const arrUserPurchaseItem =
    await purchaseItemService.getPurchaseItemByPurchaseId(
      userPurchase.user_id,
      userPurchase._id
    );

  if (!arrUserPurchaseItem.length) {
    debug(
      `User purchase item not found. userId: ${userPurchase?.user_id} purchaseId: ${userPurchase?._id}`
    );
    return {
      code: RESPONSE_CODE.NOT_FOUND_INPUT,
      status: RESPONSE_STATUS.FAILED,
    };
  }

  for (const purchaseItem of arrUserPurchaseItem) {
    const contentAttribute = await getContentAttribute(
      purchaseItem.item_type,
      purchaseItem.item_id
    );
    purchaseItem.contentAttribute = contentAttribute;
  }
  userPurchase.items = arrUserPurchaseItem;

  return {
    code: RESPONSE_CODE.SUCCESS,
    status: RESPONSE_STATUS.SUCCESS,
    data: userPurchase,
  };
};

export default getUserOrderByIdAction;
