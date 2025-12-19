import { MiddlewareFn } from 'type-graphql';
import {
  AppHeaderContext,
  UserContext,
} from '../graphql/plugins/buildAppHeaderContext';
import { RESPONSE_CODE, RESPONSE_STATUS } from '../constants';

const userMiddleware: MiddlewareFn<AppHeaderContext> = async (
  { context },
  next
): Promise<any> => {
  const userContext: UserContext = context.userContext;
  if (!userContext?.user?.mysabayUserID) {
    return {
      code: RESPONSE_CODE.UNAUTHORIZED,
      status: RESPONSE_STATUS.FAILED,
    };
  }

  return next();
};

export default userMiddleware;
