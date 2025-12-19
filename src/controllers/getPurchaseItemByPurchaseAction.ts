import { PurchaseItemService } from '../services';
import { ObjectId } from '../types';
import { PurchaseItem } from '../entities';

const getPurchaseItemByPurchaseAction = async (
  userId: number,
  purchaseId: ObjectId
): Promise<PurchaseItem[]> => {
  const purchaseItemService = new PurchaseItemService();

  const purchaseItem = await purchaseItemService.getPurchaseItemByPurchaseId(
    userId,
    purchaseId
  );

  return purchaseItem;
};

export default getPurchaseItemByPurchaseAction;
