import { JSONStringParser } from '../../utils';

export interface UserContext {
  user?: {
    uuid?: string;
    serviceCode?: string;
    mysabayUserID?: number;
    type?: string;
    emailVerified?: number;
    phoneVerified?: number;
    displayName?: string;
  };
}

export interface AppHeaderContext {
  protocol?: string;
  serviceCode?: string;
  userContext?: UserContext;
  spanParent?: unknown;
  userAgent?: string;
  ipAddress?: string;
  authorization?: string;
}

export const buildAppHeaderContext = ({ req }): AppHeaderContext => {
  return {
    protocol: `${req.protocol}://${req.headers.host}`,
    serviceCode: req.headers['service-code'],
    userContext: JSONStringParser(req.headers['user-context']),
    spanParent: req.headers['span-parent'],
    userAgent: JSONStringParser(req.headers['user-agent']),
    ipAddress: JSONStringParser(
      req?.headers['x-forwarded-for'] || req?.socket?.remoteAddress
    ),
    authorization: req.headers['authorization'],
  };
};
