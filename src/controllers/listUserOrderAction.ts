import {
  UserPurchaseDataResponse,
  ListUserOrderInput,
} from '../graphql/typeDefs';
import { PurchaseService } from '../services';

const listUserOrderAction = async (
  data: {
    hash: string;
    signature: string;
    timestamp: number;
    input: ListUserOrderInput;
  },
  user: { mysabayUserID?: number }
): Promise<UserPurchaseDataResponse> => {
  const { input } = data;

  const purchaseService = new PurchaseService();
  return await purchaseService.listUserOrders(
    user.mysabayUserID,
    input?.filter,
    input?.pager
  );
};

export default listUserOrderAction;
