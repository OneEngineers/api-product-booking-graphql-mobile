import {
  ListUserReferrerInput,
  ListUserReferrerResponse,
} from '../graphql/typeDefs';
import { UserReferrerService } from '../services/userReferrerService';

const listUserReferrerAction = async (
  queryOption: {
    hash: string;
    signature: string;
    timestamp: number;
    input: ListUserReferrerInput;
  },
  user: { mysabayUserID?: number }
): Promise<ListUserReferrerResponse> => {
  const userReferrerService = new UserReferrerService();
  return await userReferrerService.listUserReferrer(
    user.mysabayUserID,
    queryOption.input?.filter,
    queryOption.input?.pager
  );
};

export default listUserReferrerAction;
