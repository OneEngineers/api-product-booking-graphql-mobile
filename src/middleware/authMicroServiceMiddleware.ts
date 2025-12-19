import { MiddlewareFn } from 'type-graphql';
import jwt from 'jsonwebtoken';
import { AppHeaderContext } from '../graphql/plugins/buildAppHeaderContext';
import { ENV } from '../constants';

const authMicroServiceMiddleware: MiddlewareFn<AppHeaderContext> = (
  { context },
  next
) => {
  try {
    if (!context.authorization) {
      throw new Error('Missing authorization header');
    }

    const accessToken = context.authorization.split(' ')[1];
    jwt.verify(accessToken, ENV.MICROSERVICE_JWT_SK);

    return next();
  } catch (err) {
    throw new Error(err.message);
  }
};

export default authMicroServiceMiddleware;
